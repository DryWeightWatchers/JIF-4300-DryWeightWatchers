
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.contrib.auth import authenticate, logout, login as django_login
from django.http import JsonResponse
from .forms import CustomUserCreationForm
from api.models import *
from .forms import *
from .serializers import WeightRecordSerializer
import json
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

def test(request: HttpRequest): 
    return HttpResponse("hello world") 

def health_check(request):
    if request.method == 'GET':
        return JsonResponse({'message': "health check passed"}, status=200)

def error_response(message, details=None, status=400):
    response = {"error": {"message": message}}
    if details:
        response["error"]["details"] = details
    return JsonResponse(response, status=status)

def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = CustomUserCreationForm(data)
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


def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            email = data.get('email')
            password = data.get('password')

            user = authenticate(request, username=email, password=password)
            token, created = Token.objects.get_or_create(user=user)

            if user is not None:
                django_login(request, user)
                return JsonResponse({'message': 'Login successful', 'role': user.role, 'token': token.key}, status=200)
            else:
                return JsonResponse({'message': 'Invalid credentials'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Failed to read JSON data'}, status=400)
    else:
        return JsonResponse({'error': 'Wrong request type'}, status=405)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
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
    

def logout_view(request):
    if request.method == 'POST':
        logout(request) 
        return JsonResponse({'message': 'Logout successful'}, status=200)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
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

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
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


def delete_account(request):
    if request.method == "DELETE":
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")

            user = User.objects.filter(id=user_id).first()
            if user:
                user.delete()
                return JsonResponse({'message': 'Successfully deleted account'}, status=200)
            else:
                return JsonResponse({'message': 'User not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
    return JsonResponse({"error": "Invalid request"}, status=400)
