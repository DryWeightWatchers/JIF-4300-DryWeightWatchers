
from django.http import JsonResponse
from django.contrib.auth import authenticate, logout, login as django_login
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.db.models import OuterRef, Subquery
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

    patientInformation = User.objects.filter(id=patient_id, role='patient').annotate(
        latest_weight=Subquery(WeightRecord.objects.filter(patient_id=patient_id).order_by('-timestamp')
                               .values('weight')[:1]),
        latest_weight_timestamp=Subquery(WeightRecord.objects.filter(patient_id=patient_id).order_by('-timestamp')
                                         .values('timestamp')[:1])
    ).values('id', 'first_name', 'last_name', 'email', 'latest_weight', 'latest_weight_timestamp')

    if patientInformation.exists():
        response_data = dict(patientInformation[0])
        response_data["weight_history"] = weight_history
        return JsonResponse(response_data, safe=False)
    else:
        return JsonResponse({"error": "Patient not found"}, status=404)


@api_view(['POST']) 
@authentication_classes([SessionAuthentication]) 
@permission_classes([IsAuthenticated]) 
def add_patient_note(request): 
    try: 
        data = json.loads(request.body) 
        patient_id = data.get('patient') 
        note_type = data.get('note_type', PatientNote.GENERIC) 
        timestamp = data.get('timestamp') 
        note = data.get('note') 

        try: 
            patient = User.objects.get(id=patient_id, role=User.PATIENT) 
        except User.DoesNotExist: 
            return JsonResponse({'error': 'Invalid patient ID'}, status=400)
    
        PatientNote.objects.create(
            patient=patient,
            note_type=note_type,
            note=note,
            timestamp=timestamp
        )

    except json.JSONDecodeError: 
        return JsonResponse({'error': 'Invalid JSON'}, status=400) 