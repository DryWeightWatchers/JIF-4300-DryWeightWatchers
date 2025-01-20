from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='registered user'),
    path('login/', views.login, name='login'),
    path('test/', views.test, name='test'), 
    path('register-provider', views.register_provider, name='register provider'), 
]