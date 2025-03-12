
from django.http import JsonResponse
from django.contrib.auth import authenticate, logout, login as django_login
from django.views.decorators.csrf import csrf_exempt
from api.models import *
from api.forms import *
from api.serializers import *
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication 


"""
Note: All patient-facing APIs should use rest_framework's JWT authentication
"""



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