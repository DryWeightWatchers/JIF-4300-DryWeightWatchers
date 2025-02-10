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
    path('record_weight/', views.record_weight, name='record weight'), 
    path('health-check/', views.health_check, name="health_check"),
    path('delete-patient/', views.delete_account, name='delete_account'),
    path('add-reminder/', views.add_reminder, name='add reminder'),
    path('get-reminders/', views.get_reminders, name='get reminders'),
    path('save-reminder/', views.save_reminder, name='save reminder'),
    path('delete-reminder/<int:id>/', views.delete_reminder, name='delete reminder'),
]