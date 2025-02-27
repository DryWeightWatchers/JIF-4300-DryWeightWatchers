from django.urls import path
from .views import shared_views, patient_views, patient_reminder_views, provider_views

urlpatterns = [
    # endpoints used by both interfaces 
    path('test/', shared_views.test, name='test'), 
    path('login/', shared_views.login, name='login'),
    path('logout/', shared_views.logout_view, name='logout'), 
    path('delete-account/', shared_views.delete_account, name='delete_account'),
    path('user/providers/delete/', shared_views.delete_relationship, name='delete-provider'),
    path('update-email/', shared_views.update_email, name='update_email'),
    path('update-phone/', shared_views.update_phone, name='update_phone'),
    path('change-password/', shared_views.change_password, name='change_password'),

    # endpoints used by patient interface, except reminders 
    path('refresh/', patient_views.refresh_access_token, name='refresh access token'), 
    path('register/', patient_views.register, name='register user'),
    path('add-relationship/', patient_views.add_relationship, name='add_relationship'),
    path('patient-profile/', patient_views.patient_profile_data, name='patient-profile'),
    path('record_weight/', patient_views.record_weight, name='record weight'), 
    path('user/providers/', patient_views.get_providers, name='get_registered_providers'),
    path('get-weight-record/', patient_views.get_weight_record, name='get weight record'),
    path('get-patient-notes/', patient_views.get_patient_notes, name='get patient notes'),
    path('patient-change-password/', patient_views.patient_change_password, name='patient_change_password'),

    # endpoints used for reminders on patient interface 
    path('get-reminders/', patient_reminder_views.get_reminders, name='get reminders'),
    path('add-reminder/', patient_reminder_views.add_reminder, name='add reminder'),
    path('save-reminder/', patient_reminder_views.save_reminder, name='save reminder'),
    path('delete-reminder/<int:id>/', patient_reminder_views.delete_reminder, name='delete reminder'),

    # endpoints used by provider interface 
    path('get-csrf-token/', provider_views.get_csrf_token, name='get_csrf_token'),
    path('register-provider/', provider_views.register_provider, name='register provider'), 
    path('dashboard/', provider_views.dashboard, name='dashboard'), 
    path('profile/', provider_views.profile_data, name='profile'),
    path('get-patient-data/', provider_views.get_patient_data, name='get_patient_data'),
]