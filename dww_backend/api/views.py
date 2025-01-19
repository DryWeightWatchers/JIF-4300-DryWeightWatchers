from django.shortcuts import render
from django.contrib.auth import login, authenticate
from django.http import JsonResponse
from .forms import CustomUserCreationForm

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

def login(request):
    if request.method == 'POST':
        import json
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        user = authenticate(request, username=email, password=password)
        if user is not None:
            return JsonResponse({"message": "Successful login", "token": "dummy-token"}, status=200)
        else:
            return JsonResponse({"message": "Invalid username or password"}, status=401)
    return JsonResponse({"message": "Method not allowed"}, status=405)  
