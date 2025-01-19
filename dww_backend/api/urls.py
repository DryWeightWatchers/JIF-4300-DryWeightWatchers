from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='registered user'),
    path('api/login/', views.login, name='login')
]