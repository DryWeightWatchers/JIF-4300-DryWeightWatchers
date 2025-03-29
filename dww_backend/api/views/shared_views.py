
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.contrib.auth import authenticate, logout, login as django_login
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from api.models import *
from api.forms import *
from api.serializers import *
import json, os
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication 
from rest_framework_simplejwt.tokens import RefreshToken
from django_ratelimit.decorators import ratelimit
from django.conf import settings
from twilio import Client

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
            # if not user.is_verified:
            #     return JsonResponse({'message': 'Account is not verified. Please check your email and verify your account.'}, status=403)
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

def send_verification_email(user):
    token = get_random_string(50)
    user.verification_token = token
    user.save()

    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    subject = 'Verify Your Email'
    
    # Create HTML content
    html_message = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <h1 style="color: #333; font-size: 24px;">Welcome to Dry Weight Watchers!</h1>
              <p style="color: #555; font-size: 16px;">Please verify your email address to activate your account.</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 20px;">
              <a href="{verification_url}" target="_blank" 
                 style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #007bff; 
                        text-decoration: none; border-radius: 4px; font-weight: bold;">
                Verify Email
              </a>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-top: 20px; font-size: 14px; color: #999;">
              If you didn't create an account, you can ignore this email.
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    from_email = settings.EMAIL_HOST_USER
    recipient_list = [user.email]

    try:
        send_mail(
            subject,
            '',
            from_email,
            recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        raise e
    
@api_view(['GET'])
def verify_email(request):
    token = request.GET.get('token')
    user = get_object_or_404(User, verification_token=token)

    user.is_verified = True
    user.verification_token = None
    user.save()

    return JsonResponse({'message': 'Email verified successfully'})


def check_and_notify_weight_change(patient, previous_weight, new_weight, providers):
    weight_change = new_weight - previous_weight
    if abs(weight_change) > 5:  # Example threshold: 5lbs or more
        weight_change_data = {
            "previous_weight": previous_weight,
            "new_weight": new_weight,
            "change": weight_change
        }

        send_weight_change_notification(patient, weight_change_data, providers)
        send_text_notification(providers)

def send_weight_change_notification(patient, weight_change, providers): # need to call this function when the drastic weight changes is detected
    subject = f"Alert: Drastic Weight Change Detected"

    message_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <h1 style="color: #333; font-size: 24px;">Weight Change Alert</h1>
              <p style="color: #555; font-size: 16px;">One of your patients has experienced a significant weight change.</p>
              <p style="color: #555; font-size: 16px;">Change: {weight_change['change']} lbs</p>
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

    message = f"Patient {patient.first_name} {patient.last_name} has experienced a dramatic weight change of {weight_change['change']} lbs. Please review the patient's data and take appropriate action if needed."

    provider_emails = [provider.email for provider in providers]
    for provider in providers:
        ProviderNotification.objects.create(
            provider=provider,
            message=message
        )

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
    
    provider_phones = [provider.phone for provider in providers if provider.phone]

    try:
        client = Client(os.environ.get('TWILIO_EMAIL'), os.environ.get('TWILIO_TOKEN'))
        for phone in provider_phones:
            message = client.messages.create(
                body=message,
                from_=os.environ.get('TWILIO_PHONE'),
                to=phone
            )
    except Exception as e:
        raise e