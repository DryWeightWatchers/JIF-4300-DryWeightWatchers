
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.contrib.auth import authenticate, logout, login as django_login
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import OuterRef, Subquery
from api.models import *
from .forms import *
from .serializers import *
import json
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication 
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django_ratelimit.decorators import ratelimit

'''
Note: All patient-facing APIs should use rest_framework's JWT authentication, and all 
provider-facing APIs should use Django's built-in (session-based) authentication 
'''

@csrf_exempt
def test(request: HttpRequest): 
    return HttpResponse("hello world") 
@csrf_exempt
def health_check(request):
    return HttpResponse("OK", content_type="text/plain", status=200)

@csrf_exempt
def error_response(message, details=None, status=400):
    response = {"error": {"message": message}}
    if details:
        response["error"]["details"] = details
    return JsonResponse(response, status=status)

@csrf_exempt
def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = RegisterUserForm(data)
            if form.is_valid():
                form.save()
                return JsonResponse({'message': "User registered successfully"}, status=201)
            else:
                print(form.errors)
                return JsonResponse({'errors': form.errors}, status=400)
        except:
            return JsonResponse({'error': "failed to read json data"}, status=400)
    else:
        return JsonResponse({'error': "wrong request type"}, status=405)

@csrf_exempt
def register_provider(request): 
    if request.method != 'POST': 
        return error_response('invalid request') 
    try:
        data = json.loads(request.body)  # Parse JSON body
    except json.JSONDecodeError:
        return error_response('invalid request') 
    
    print(f'data: {data}')
    form = RegisterProviderForm(data) 
    if form.is_valid(): 
        try: 
            user = form.save(commit=False) 
            user.role = User.PROVIDER 
            user.set_password(form.cleaned_data['password'])
            user.save()

        except Exception as e: 
            print(f'error: {e}')
            return error_response('An unexpected error occurred', status=500) 
        return JsonResponse({}, status=201)
    else: 
        return error_response('Registration unsuccessful.', details=form.errors) 


@csrf_exempt
@ratelimit(key='ip', rate='5/m', method='POST', block=False) 
def login(request):
    if request.method != 'POST': 
        return JsonResponse({'error': 'Wrong request type'}, status=405)
    if getattr(request, 'limited', False): 
        print("rate limit triggered")
        return JsonResponse({'message': 'Too many login attempts. Please try again later.'}, status=429)
    try:
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email')
        password = data.get('password')
        user = authenticate(request, username=email, password=password)
        if user is None: 
            return JsonResponse({'message': 'Invalid credentials'}, status=400) 
        
        # use JWT for patients 
        if user.role == User.PATIENT: 
            print('views.py: login: patient')
            refresh = RefreshToken.for_user(user) 
            return JsonResponse({
                'message': 'Login successful', 
                'role': user.role, 
                'access_token': str(refresh.access_token), 
                'refresh_token': str(refresh)
            }, status=200)
        
        # use Django's built-in session-based auth for providers 
        elif user.role == User.PROVIDER: 
            print('views.py: login: provider'); 
            django_login(request, user) 
            request.session.save()
            response = JsonResponse({
                'message': 'Login successful', 
                'role': user.role
            })
            response.set_cookie('sessionid', request.session.session_key, samesite='None', secure=True)  
            return response        
        else: 
            return JsonResponse({'error': 'Invalid role'}, status=403)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Failed to read JSON data'}, status=400)

@csrf_exempt
def refresh_access_token(request): 
    if request.method != 'POST': 
        return JsonResponse({'error': 'Wrong request type'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
        refresh_token = data.get("refresh_token")
        if not refresh_token:
            return JsonResponse({'error': 'Refresh token is required'}, status=400)

        try:
            refresh = RefreshToken(refresh_token) 
            access_token = str(refresh.access_token) 
            return JsonResponse({'access_token': access_token}, status=200)
        
        except TokenError:
            return JsonResponse({'error': 'Invalid or expired refresh token'}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)

@csrf_exempt
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_relationship(request): 
    try:
        print("Authenticated User:", request.user)
        print("Received Token:", request.headers.get("Authorization"))

        data = request.data
        shareable_id = data.get('shareable_id')

        if not shareable_id:
            return Response({'error': "Provider shareable ID is required"}, status=400)

        try:
            provider = User.objects.get(shareable_id=shareable_id, role=User.PROVIDER)
        except User.DoesNotExist:
            return Response({'error': 'Invalid ID'}, status=404)

        patient = request.user

        if patient.is_anonymous:
            return Response({'error': 'User is not authenticated'}, status=403)

        if TreatmentRelationship.objects.filter(patient=patient, provider=provider).exists():
            return Response({'message': 'Relationship already exists'}, status=202)

        relationship = TreatmentRelationship.objects.create(patient=patient, provider=provider)

        return Response({"message": "Relationship created successfully"}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        logout(request) 
        return JsonResponse({'message': 'Logout successful'}, status=200)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


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

@csrf_exempt
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def record_weight(request):
    try:
        print('Authenticated User:', request.user)
        print('Received Token:', request.headers.get('Authorization'))

        user = request.user
        weight = request.data.get('weight')

        serializer = WeightRecordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=400)

        if not weight:
            return JsonResponse({'error': 'Weight field is required'}, status=400)
        WeightRecord.objects.create(patient=user, weight=serializer.validated_data['weight'])

        return JsonResponse({'message': 'Weight recorded successfully'}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@api_view(["DELETE"])
@authentication_classes([SessionAuthentication, JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_account(request):
    if request.method == "DELETE":
        user = request.user
        user.delete()
        return JsonResponse({'message': 'Successfully deleted account'}, status=200)
    else:
        return JsonResponse({"error": "Invalid request"}, status=400)
    

@csrf_exempt 
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_reminder(request):
    try:
        user = request.user

        serializer = ReminderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=400)
        
        PatientReminder.objects.create(patient=user, time=serializer.validated_data['time'], days=serializer.validated_data['days'])
        return JsonResponse({'message': 'Reminder added successfully'}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt 
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_reminders(request):
    try:
        user = request.user
        reminders = PatientReminder.objects.filter(patient=user).values('id', 'time', 'days')
        return JsonResponse(list(reminders), safe=False, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt   
@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def save_reminder(request):
    try:
        user = request.user
        reminder_id = request.data.get('id')

        serializer = ReminderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=400)
        
        try:
            reminder = PatientReminder.objects.get(id=reminder_id, patient=user)
        except PatientReminder.DoesNotExist:
            return JsonResponse({'error': 'Reminder not found'}, status=404)
        
        reminder.time = serializer.validated_data['time']
        reminder.days = serializer.validated_data['days']

        reminder.save()

        return JsonResponse({'message': 'Reminder saved successfully'}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt   
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_reminder(request, id):
    try:
        user = request.user
        
        try:
            reminder = PatientReminder.objects.get(id=id, patient=user)
        except PatientReminder.DoesNotExist:
            return JsonResponse({'error': 'Reminder not found'}, status=404)
        
        reminder.delete()

        return JsonResponse({'message': 'Reminder deleted successfully'}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_csrf_token(request):
    response = JsonResponse({'csrfToken': get_token(request)})
    response.set_cookie('csrftoken', get_token(request), httponly=True, secure=True, samesite='None')
    return response

@csrf_exempt
@api_view(['GET'])
def get_providers(request):
    try:
        patient = request.user
        treatment_relationships = TreatmentRelationship.objects.filter(patient=patient)
        providers = [relationship.provider for relationship in treatment_relationships]

        serializer = UserSerializer(providers, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_relationship(request):
    shareable_id = request.data.get("shareable_id")
    if not shareable_id:
        return Response({"error": "Shareable ID is required."}, status=400)

    try:
        provider = User.objects.get(shareable_id=shareable_id, role=User.PROVIDER)
        relationship = TreatmentRelationship.objects.get(patient=request.user, provider=provider)
        relationship.delete()
        return Response({"message": "Relationship deleted successfully."}, status=200)
    except User.DoesNotExist:
        return Response({"error": "Provider not found."}, status=404)
    except TreatmentRelationship.DoesNotExist:
        return Response({"error": "Relationship not found."}, status=404)
