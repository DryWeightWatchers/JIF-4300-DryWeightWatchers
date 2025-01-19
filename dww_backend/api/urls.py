from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test, name='test'), 
    path('test-register', views.test_register, name='test register'), 
    path('register/', views.register, name='register user')
]