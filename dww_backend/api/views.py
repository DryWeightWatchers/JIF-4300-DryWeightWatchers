
from django.http import HttpRequest, HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .forms import CustomUserCreationForm
from api.models import User
from .forms import *
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json

def test(request: HttpRequest): 
    return HttpResponse("hello world") 


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

            if user is not None:
                django_login(request, user)
                return JsonResponse({'message': 'Login successful'}, status=200)
            else:
                return JsonResponse({'message': 'Invalid credentials'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Failed to read JSON data'}, status=400)
    else:
        return JsonResponse({'error': 'Wrong request type'}, status=405)
