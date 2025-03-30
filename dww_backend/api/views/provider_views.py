
from datetime import timedelta
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.db.models import OuterRef, Subquery
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from api.models import *
from api.forms import *
from api.serializers import *
import json
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from api.views.shared_views import send_verification_email

"""
Note: All provider-facing APIs should use Django's built-in (session-based) authentication 
"""

# this is a utility function, not a view 
def error_response(message, details=None, status=400):
    response = {"error": {"message": message}}
    if details:
        response["error"]["details"] = details
    return JsonResponse(response, status=status)


@api_view(['GET']) 
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_auth_status(request): 
    return JsonResponse({}, status=200) 
    # whether this returns a 200 or 401/403 is used for the client to determine whether it's authenticated 


@api_view(['GET'])
def get_csrf_token(request):
    response = JsonResponse({'csrfToken': get_token(request)})
    response.set_cookie('csrftoken', get_token(request), httponly=True, secure=True, samesite='None')
    return response


@csrf_exempt
@api_view(['POST'])
def register_provider(request): 
    try:
        data = json.loads(request.body)  # Parse JSON body
    except json.JSONDecodeError:
        return error_response('invalid request') 
    
    form = RegisterProviderForm(data) 
    if form.is_valid(): 
        try: 
            user = form.save(commit=False) 
            user.role = User.PROVIDER 
            user.set_password(form.cleaned_data['password'])
            user.save()
            send_verification_email(user)
        except Exception as e: 
            return error_response('An unexpected error occurred', status=500) 
        return JsonResponse({}, status=201)
    else: 
        return error_response('Registration unsuccessful.', details=form.errors) 


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def profile_data(request):
    user = request.user
    return JsonResponse({
        'firstname': user.first_name,
        'lastname': user.last_name,
        'shareable_id': user.shareable_id,
        'email': user.email,
        'phone': str(user.phone),
        'is_verified': user.is_verified
    })


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def dashboard(request): 

    # get all patients associated with this provider 
    provider = request.user 
    patient_ids = TreatmentRelationship.objects.filter(
        provider_id=provider.id 
    ).values_list('patient_id', flat=True)

    # subquery to get the latest weight and timestamp
    latest_weight_subquery = WeightRecord.objects.filter(
        patient_id=OuterRef('id')
    ).order_by('-timestamp')

    # subquery to get alarm_threshold from related PatientInfo
    alarm_threshold_subquery = PatientInfo.objects.filter(
        patient_id=OuterRef('id')
    ).values('alarm_threshold')[:1]

    patients_qs = User.objects.filter(id__in=patient_ids, role='patient').annotate(
        latest_weight=Subquery(latest_weight_subquery.values_list('weight', flat=True)[:1]),
        latest_weight_timestamp=Subquery(latest_weight_subquery.values_list('timestamp', flat=True)[:1]),
        alarm_threshold=Subquery(alarm_threshold_subquery)
    ).values(
        'id', 'first_name', 'last_name', 'email',
        'latest_weight', 'latest_weight_timestamp',
        'alarm_threshold'
    )
    patients = list(patients_qs)

    # get prev weight/timestamp that is at least one day before the latest 
    for patient in patients:
        patient_id = patient['id']
        latest_timestamp = patient['latest_weight_timestamp']

        if latest_timestamp:
            prev_record = (
                WeightRecord.objects.filter(
                    patient_id=patient_id,
                    timestamp__date__lt=latest_timestamp.date()
                )
                .order_by('-timestamp')
                .values('weight', 'timestamp')
                .first()
            )
        else:
            prev_record = None

        patient['prev_weight'] = prev_record['weight'] if prev_record else None
        patient['prev_weight_timestamp'] = prev_record['timestamp'] if prev_record else None

    return JsonResponse({'patients': patients})


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_patient_data(request):
    patient_id = request.GET.get("id")

    # get weight records 
    weight_history = list(WeightRecord.objects.filter(
        patient_id=patient_id
    ).order_by('timestamp').values('weight', 'timestamp'))

    # get account info and last weight record for convenience 
    patient = User.objects.filter(id=patient_id, role='patient').annotate(
        latest_weight=Subquery(WeightRecord.objects.filter(patient_id=patient_id).order_by('-timestamp')
                .values('weight')[:1]),
        latest_weight_timestamp=Subquery(WeightRecord.objects.filter(patient_id=patient_id).order_by('-timestamp')
                .values('timestamp')[:1])
    ).values('id', 'first_name', 'last_name', 'email', 'latest_weight', 'latest_weight_timestamp')
    if not patient.exists(): 
        return JsonResponse({"error": "Patient not found"}, status=404)

    # get all timestamped notes 
    patient_notes = list(PatientNote.objects.filter(
        patient_id=patient_id
    ).order_by('-timestamp').values('id', 'timestamp', 'note'))

    # get patient fields 
    patient_info = PatientInfo.objects.filter(
        patient_id=patient_id
    ).values('height', 'date_of_birth', 'sex', 'medications', 'other_info', 'last_updated', 'alarm_threshold'
    ).first() or {} 
    default_patient_info = {
        'patient': patient_id, 
        'height': '',
        'date_of_birth': '',
        'sex': '',
        'medications': '',
        'other_info': '',
        'last_updated': None, 
        'alarm_threshold': None
    }
    patient_info = {**default_patient_info, **patient_info}  # merging db data (if exists) into default object 
    
    # construct and send response 
    response_data = dict(patient[0])
    response_data["weight_history"] = weight_history
    response_data["notes"] = patient_notes 
    response_data["patient_info"] = patient_info
    return JsonResponse(response_data, safe=False)


@api_view(['POST']) 
@authentication_classes([SessionAuthentication]) 
@permission_classes([IsAuthenticated]) 
def add_patient_note(request): 
    try: 
        data = request.data
        note_id = data.get('note_id') 
        patient_id = data.get('patient') 
        timestamp = data.get('timestamp') 
        note = data.get('note') 

        try: 
            patient = User.objects.get(id=patient_id, role=User.PATIENT) 
        except User.DoesNotExist: 
            return JsonResponse({'error': 'Invalid patient ID'}, status=400)
    
        if note_id is not None:
            try:
                patient_note = PatientNote.objects.get(id=note_id, patient=patient)
                patient_note.note = note
                patient_note.timestamp = timestamp
                patient_note.save()
                return JsonResponse({'updated': True}, status=200)
            except PatientNote.DoesNotExist:
                return JsonResponse({'error': 'Note not found for update'}, status=404)
        else:
            PatientNote.objects.create(
                patient=patient,
                note=note,
                timestamp=timestamp
            )
            return JsonResponse({'created': True}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def delete_patient_note(request):
    try:
        data = request.data
        note_id = data.get('note_id')
        if not note_id:
            return JsonResponse({'error': 'Missing note_id'}, status=400)

        try:
            note = PatientNote.objects.get(id=note_id)
        except PatientNote.DoesNotExist:
            return JsonResponse({'error': 'Note not found'}, status=404)

        note.delete()
        return JsonResponse({'message': 'Note deleted successfully'}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@api_view(['POST']) 
@authentication_classes([SessionAuthentication]) 
@permission_classes([IsAuthenticated]) 
def add_patient_info(request):
    data = request.data.copy()
    for key, value in data.items():
        if value == "": data[key] = None
    
    print(f'add_patient_info: {data}') 

    try:
        patient = User.objects.get(id=data['patient'], role=User.PATIENT)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Invalid patient ID'}, status=400)

    patient_info, _ = PatientInfo.objects.get_or_create(patient=patient)

    serializer = PatientInfoSerializer(patient_info, data=data, partial=True)
    if serializer.is_valid():
        serializer.save(last_updated=timezone.now())  
        return JsonResponse({}, status=200)
    
    print(f'Serializer errors: {serializer.errors}')
    return JsonResponse({'error': 'Invalid JSON'}, status=400) 

@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_provider_notifications(request):
    user = request.user
    if user.role != User.PROVIDER:
        return JsonResponse({'error': 'Only providers can access this'}, status=403)

    notifications = ProviderNotification.objects.filter(provider=user).order_by('-created_at')
    data = [
        {
            'message': n.message,
            'created_at': n.created_at.isoformat(),
            'is_read': n.is_read,
            'id': n.id
        }
        for n in notifications
    ]
    return JsonResponse({'notifications': data}, status=200)

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, id):
    try:
        notification = ProviderNotification.objects.get(id=id)
        notification.is_read = True
        notification.save()
        return JsonResponse({'message': 'Marked as read'}, status=200)
    except ProviderNotification.DoesNotExist:
        return JsonResponse({'error': 'Notification not found'}, status=404)
