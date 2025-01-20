
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login
from api.models import User
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
                print(form.errors)
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
