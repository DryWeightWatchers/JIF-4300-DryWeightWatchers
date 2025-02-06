from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),
    path('test/', views.test, name='test'), 
    path('register-provider', views.register_provider, name='register provider'), 
    path('register/', views.register, name='register user'),
    path('add-relationship/', views.add_relationship, name='add_relationship'),
    path('logout/', views.logout_view, name='logout'), 
    path('profile/', views.profile_data, name='profile'),
    path('health-check/', views.health_check, name="health_check"),
    path('delete-patient/', views.delete_account, name='delete_account')
]