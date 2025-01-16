from django.shortcuts import render
from django.contrib.auth import login
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
