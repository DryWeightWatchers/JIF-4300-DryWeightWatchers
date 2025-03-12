
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.contrib.auth import authenticate, logout, login as django_login
from django.views.decorators.csrf import csrf_exempt
from api.models import *
from api.forms import *
from api.serializers import *
import json
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication 
from rest_framework_simplejwt.tokens import RefreshToken
from django_ratelimit.decorators import ratelimit


@csrf_exempt
def test(request: HttpRequest): 
    return HttpResponse("hello world") 

@csrf_exempt
@api_view(['POST'])
@ratelimit(key='ip', rate='5/m', method='POST', block=False)
def login_view(request):
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
            if not user.is_verified:
                return JsonResponse({'message': 'Account is not verified. Please check your email and verify your account.'}, status=403)
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


@api_view(['POST'])
def logout_view(request):
    logout(request) 
    return JsonResponse({'message': 'Logout successful'}, status=200)


@api_view(["DELETE"])
@authentication_classes([SessionAuthentication, JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    deactivated_user = DeactivatedUsers.objects.create(
        original_id= user.id,
        firstname= user.first_name,
        lastname= user.last_name,
        email= user.email,
        phone= user.phone
    )
    user.delete()
    return JsonResponse({'message': 'Successfully deactivated account'}, status=200)


@api_view(["DELETE"])
@authentication_classes([SessionAuthentication, JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_relationship(request):
    if request.user.role == User.PATIENT:
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
        
    elif request.user.role == User.PROVIDER:
        try:
            patient_id = request.data.get("id")
            patient = User.objects.get(id=patient_id)
            relationship = TreatmentRelationship.objects.get(patient=patient, provider=request.user)
            relationship.delete()
            return Response({"message": "Relationship deleted successfully."}, status=200)
        except User.DoesNotExist:
            return Response({"error": "Patient not found."}, status=404)
        except TreatmentRelationship.DoesNotExist:
            return Response({"error": "Relationship not found."}, status=404)


@api_view(['POST'])
@authentication_classes([SessionAuthentication, JWTAuthentication])
@permission_classes([IsAuthenticated])
def change_email(request):
    try:
        new_email = request.data.get('email')
        if not new_email:
            return JsonResponse({'error': 'Email is required.'}, status=400)
        user = request.user
        user.email = new_email
        print(new_email)
        user.save()
        return JsonResponse({'message': 'Email updated successfully.', 'email': new_email}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['POST'])
@authentication_classes([SessionAuthentication, JWTAuthentication])
@permission_classes([IsAuthenticated])
def change_phone(request):
    try:
        new_phone = request.data.get('phone')
        if not new_phone:
            return JsonResponse({'error': 'Phone number is required.'}, status=400)
        user = request.user
        user.phone = new_phone
        user.save()
        return JsonResponse({'message': 'Phone number updated successfully.', 'phone': new_phone}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['POST'])
@authentication_classes([SessionAuthentication, JWTAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):
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
        django_login(request, user) # need to redo this after password is changed
        request.session.save()
        return JsonResponse({'message': 'Password updated successfully.'}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# @api_view(["DELETE"])
# @authentication_classes([SessionAuthentication, JWTAuthentication])
# @permission_classes([IsAuthenticated])
# def delete_account(request):
#     user = request.user
#     user.delete()
#     return JsonResponse({'message': 'Successfully deleted account'}, status=200)