
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.contrib.auth import login
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


def test_register(request): 
    if request.method != 'POST': 
        return HttpResponse("error: wrong request type") 
    try:
        data = json.loads(request.body)  # Parse JSON body
    except json.JSONDecodeError:
        return HttpResponse("error: invalid JSON")
    
    form = RegisterForm(data) 
    if form.is_valid(): 
        return HttpResponse("registered successfully!") 
    else: 
        return HttpResponse("registration unsuccessful :(")
