
from django.http import JsonResponse
from django.contrib.auth import authenticate, logout, login as django_login
from django.views.decorators.csrf import csrf_exempt
from api.models import *
from api.forms import *
from api.serializers import *
import json
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication 
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


"""
Note: All patient-facing APIs should use rest_framework's JWT authentication
"""



@csrf_exempt
@api_view(['POST'])
def refresh_access_token(request): 
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
def register(request):
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


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_providers(request):
    try:
        patient = request.user
        treatment_relationships = TreatmentRelationship.objects.filter(patient=patient)
        providers = [relationship.provider for relationship in treatment_relationships]
        serializer = UserSerializer(providers, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_relationship(request): 
    try:
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


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def patient_profile_data(request):
    user = request.user
    print(request.user.password)
    return JsonResponse({
        'firstname': user.first_name,
        'lastname': user.last_name,
        'email': user.email,
        'phone': str(user.phone)
    })


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def patient_change_password(request):
    try:
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        if not current_password or not new_password or not confirm_password:
            return JsonResponse({'error': 'All fields are required.'}, status=400)
        user = request.user
        if not user.check_password(current_password):
            return JsonResponse({'error': 'Incorrect current password.'}, status=400)
        if new_password != confirm_password:
            return JsonResponse({'error': 'New passwords do not match.'}, status=400)
        user.set_password(new_password)
        user.save()
        django_login(request, user) 
        request.session.save()
        return JsonResponse({'message': 'Password updated successfully.'}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['GET'])   
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_weight_record(request):
    try:
        user = request.user
        try:
            weight_history = list(WeightRecord.objects.filter(
                patient=user
                ).order_by('timestamp').values('weight', 'timestamp'))
        except WeightRecord.DoesNotExist:
            return JsonResponse({'error': 'Record not found'}, status=404)
        
        return JsonResponse(weight_history, safe=False, status=201)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


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
    

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_patient_notes(request):
    try:
        user = request.user
        try:
            patient_notes = list(PatientNote.objects.filter(
                patient=user
                ).order_by('timestamp').values('note', 'timestamp'))
        except PatientNote.DoesNotExist:
            return JsonResponse({'error': 'Notes not found'}, status=404)
        
        return JsonResponse(patient_notes, safe=False, status=201)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)