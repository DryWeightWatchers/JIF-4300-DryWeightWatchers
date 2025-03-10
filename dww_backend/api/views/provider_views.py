
from django.http import JsonResponse
from django.contrib.auth import authenticate, logout, login as django_login
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.db.models import OuterRef, Subquery
from django.utils import timezone
from api.models import *
from api.forms import *
from api.serializers import *
import json
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication

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
        'phone': str(user.phone)
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

    # subquery to get the most recent weight record for each patient 
    latest_weight_subquery = WeightRecord.objects.filter(
        patient_id=OuterRef('id')
    ).order_by('-timestamp').values_list('weight', 'timestamp')[:1] 

    # main query to get all needed info 
    patients = User.objects.filter(id__in=patient_ids, role='patient').annotate(
        latest_weight=Subquery(latest_weight_subquery.values_list('weight', flat=True)),
        latest_weight_timestamp=Subquery(latest_weight_subquery.values_list('timestamp', flat=True))
    ).values('id', 'first_name', 'last_name', 'email', 'latest_weight', 'latest_weight_timestamp')

    return JsonResponse({'patients': list(patients)})


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_patient_data(request):
    patient_id = request.GET.get("id")

    weight_history = list(WeightRecord.objects.filter(
        patient_id=patient_id
    ).order_by('timestamp').values('weight', 'timestamp'))

    patient = User.objects.filter(id=patient_id, role='patient').annotate(
        latest_weight=Subquery(WeightRecord.objects.filter(patient_id=patient_id).order_by('-timestamp')
                               .values('weight')[:1]),
        latest_weight_timestamp=Subquery(WeightRecord.objects.filter(patient_id=patient_id).order_by('-timestamp')
                                         .values('timestamp')[:1])
    ).values('id', 'first_name', 'last_name', 'email', 'latest_weight', 'latest_weight_timestamp')

    patient_notes = list(PatientNote.objects.filter(
        patient_id=patient_id
    ).order_by('-timestamp').values('id', 'timestamp', 'note'))

    if not patient.exists(): 
        return JsonResponse({"error": "Patient not found"}, status=404)
    
    patient_info = PatientInfo.objects.filter(
        id=patient_id
    ).values('height', 'date_of_birth', 'sex', 'medications', 'other_info', 'last_updated'
    ).first() or {} 

    default_patient_info = {
        'height': '',
        'date_of_birth': '',
        'sex': '',
        'medications': '',
        'other_info': '',
        'last_updated': None 
    }
    patient_info = {**default_patient_info, **patient_info}  # merging db data (if exists) into default object 
    
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
        patient_id = data.get('patient') 
        timestamp = data.get('timestamp') 
        note = data.get('note') 

        try: 
            patient = User.objects.get(id=patient_id, role=User.PATIENT) 
        except User.DoesNotExist: 
            return JsonResponse({'error': 'Invalid patient ID'}, status=400)
    
        PatientNote.objects.create(
            patient=patient,
            note=note,
            timestamp=timestamp
        )
        return JsonResponse({}, status=200)

    except json.JSONDecodeError: 
        return JsonResponse({'error': 'Invalid JSON'}, status=400) 


@api_view(['POST']) 
@authentication_classes([SessionAuthentication]) 
@permission_classes([IsAuthenticated]) 
def add_patient_info(request): 
    try: 
        data = request.data 
        patient_id = data.get('patient') 
        date_of_birth = data.get('date_of_birth') 
        height = data.get('height') 
        sex = data.get('sex') 
        medications = data.get('medications') 
        other_info = data.get('other_info') 
        try: 
            patient = User.objects.get(id=patient_id, role=User.PATIENT) 
        except User.DoesNotExist: 
            return JsonResponse({'error': 'Invalid patient ID'}, status=400)

        patient_info, _ = PatientInfo.objects.get_or_create(patient_id=patient_id)
        patient_info.date_of_birth = date_of_birth
        patient_info.height = height
        patient_info.sex = sex
        patient_info.medications = medications
        patient_info.other_info = other_info
        patient_info.last_updated = timezone.now() 
        patient_info.save()

    except json.JSONDecodeError: 
        return JsonResponse({'error': 'Invalid JSON'}, status=400) 