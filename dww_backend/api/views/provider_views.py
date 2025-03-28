
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
    ).values('height', 'date_of_birth', 'sex', 'medications', 'other_info', 'last_updated'
    ).first() or {} 
    default_patient_info = {
        'patient': patient_id, 
        'height': '',
        'date_of_birth': '',
        'sex': '',
        'medications': '',
        'other_info': '',
        'last_updated': None 
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

def send_weight_change_notification(patient, weight_change, providers): # need to call this function when the drastic weight changes is detected
    subject = f"Alert: Drastic Weight Change for {patient.first_name} {patient.last_name}"

    message_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <h1 style="color: #333; font-size: 24px;">Weight Change Alert</h1>
              <p style="color: #555; font-size: 16px;">Patient {patient.first_name} {patient.last_name} has experienced a significant weight change.</p>
              <p style="color: #555; font-size: 16px;">Previous Weight: {weight_change['previous_weight']} kg</p>
              <p style="color: #555; font-size: 16px;">New Weight: {weight_change['new_weight']} kg</p>
              <p style="color: #555; font-size: 16px;">Change: {weight_change['change']} kg</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-top: 20px; font-size: 14px; color: #999;">
              Please review the patient's data and take appropriate action if needed.
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    provider_emails = [provider.email for provider in providers]

    from_email = settings.EMAIL_HOST_USER

    try:
        send_mail(
            subject,
            '',
            from_email,
            provider_emails,
            html_message=message_content,
            fail_silently=False,
        )
    except Exception as e:
        raise e
