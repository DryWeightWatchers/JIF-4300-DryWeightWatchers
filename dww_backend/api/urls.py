from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),
    path('refresh/', views.refresh_access_token, name='refresh access token'), 
    path('test/', views.test, name='test'), 
    path('register-provider/', views.register_provider, name='register provider'), 
    path('register/', views.register, name='register user'),
    path('add-relationship/', views.add_relationship, name='add_relationship'),
    path('logout/', views.logout_view, name='logout'), 
    path('dashboard/', views.dashboard, name='dashboard'), 
    path('profile/', views.profile_data, name='profile'),
    path('patient-profile/', views.patient_profile_data, name='patient-profile'),
    path('record_weight/', views.record_weight, name='record weight'), 
    path('health-check/', views.health_check, name="health_check"),
    path('add-reminder/', views.add_reminder, name='add reminder'),
    path('get-reminders/', views.get_reminders, name='get reminders'),
    path('save-reminder/', views.save_reminder, name='save reminder'),
    path('delete-reminder/<int:id>/', views.delete_reminder, name='delete reminder'),
    path('delete-account/', views.delete_account, name='delete_account'),
    path('user/providers/', views.get_providers, name='get_registered_providers'),
    path('user/providers/delete/', views.delete_relationship, name='delete-provider'),
    path('get-csrf-token/', views.get_csrf_token, name='get_csrf_token'),
    path('get-patient-data/', views.get_patient_data, name='get_patient_data'),
    path('get-weight-record/', views.get_weight_record, name='get weight record'),
    path('get-patient-notes/', views.get_patient_notes, name='get patient notes'),
    path('update-email/', views.update_email, name='update_email'),
    path('update-phone/', views.update_phone, name='update_phone'),
    path('change-password/', views.change_password, name='change_password'),
    path('patient-change-password/', views.patient_change_password, name='patient_change_password'),
]