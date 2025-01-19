
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import render
from django.contrib.auth import login
from api.models import User
from .forms import *
import json


def test(request: HttpRequest): 
    return HttpResponse("hello world") 


def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return # login success signal?
    else:
        form = CustomUserCreationForm()
    return # login failure signal


def register_provider(request): 
    if request.method != 'POST': 
        return JsonResponse({"error": "invalid request"}, status=400)
    try:
        data = json.loads(request.body)  # Parse JSON body
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid request"}, status=400)
    
    form = RegisterProviderForm(data) 
    if form.is_valid(): 
        try: 
            user = User.objects.create_user(
                first_name = form.cleaned_data.get('firstname'), 
                last_name = form.cleaned_data.get('lastname'), 
                email = form.cleaned_data.get('email'), 
                phone = form.cleaned_data.get('phone'), 
                password = form.cleaned_data.get('password'), 
                role = User.PROVIDER
            )
            user.save()
        except Exception as e: 
            return JsonResponse({'error': f'Registration failed: {str(e)}'}, status=400)
        return JsonResponse({"message": "registered successfully!"}, status=201)
    else: 
        return JsonResponse({"message": "registration unsuccessful", "errors": form.errors}, status=400)
