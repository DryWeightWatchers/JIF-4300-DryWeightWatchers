from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),
    path('refresh/', views.refresh_access_token, name='refresh access token'), 
    path('test/', views.test, name='test'), 
    path('register-provider', views.register_provider, name='register provider'), 
    path('register/', views.register, name='register user'),
    path('add-relationship/', views.add_relationship, name='add_relationship'),
    path('logout/', views.logout_view, name='logout'), 
    path('profile/', views.profile_data, name='profile'),
    path('record_weight/', views.record_weight, name='record weight'), 
    path('health-check/', views.health_check, name="health_check"),
    path('delete-patient/', views.delete_account, name='delete_account'),
    path('user/providers/', views.get_providers, name='get_registered_providers'),
    path('user/providers/delete/', views.delete_relationship, name='delete-provider'),
]