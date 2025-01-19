from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test, name='test'), 
    path('register-provider', views.register_provider, name='register provider'), 
    path('register/', views.register, name='register user')
]