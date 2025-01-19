
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login
from .forms import *
import json

def test(request: HttpRequest): 
    return HttpResponse("hello world") 

def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = CustomUserCreationForm(data)
            if form.is_valid():
                form.save()
                return JsonResponse({'message': "User registered successfully"}, status=201)
            else:
                return JsonResponse({'errors': form.errors}, status=400)
        except:
            return JsonResponse({'errors': "failed to read json data"}, status=400)
    else:
        return JsonResponse({'error': "wrong request type"}, status=405)

def login(request):
    if request.method == 'POST':
        return # login logic. check for user from authenticate() and then use login(), and hopefully that works if I did everything correctly
    else:
        return #wrong request type


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
