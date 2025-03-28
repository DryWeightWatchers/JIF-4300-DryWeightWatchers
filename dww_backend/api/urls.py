from django.urls import path
from .views import shared_views, patient_views, patient_reminder_views, provider_views

urlpatterns = [
    # endpoints used by both interfaces 
    ## testing & auth 
    path('test/', shared_views.test, name='test'), 
    path('login/', shared_views.login_view, name='login'),
    path('logout/', shared_views.logout_view, name='logout'), 
    path('verify-email/', shared_views.verify_email, name='verify_email'), 
    ## account management 
    path('delete-account/', shared_views.delete_account, name='delete_account'),
    path('delete-relationship/', shared_views.delete_relationship, name='delete_provider'),
    path('change-email/', shared_views.change_email, name='change_email'),
    path('change-phone/', shared_views.change_phone, name='change_phone'),
    path('change-password/', shared_views.change_password, name='change_password'),

    # endpoints used by patient interface 
    ## auth & account 
    path('refresh-jwt/', patient_views.refresh_access_token, name='refresh_access_token'), 
    path('register/', patient_views.register, name='register_user'),
    path('user/providers/', patient_views.get_providers, name='get_registered_providers'),
    path('add-relationship/', patient_views.add_relationship, name='add_relationship'),
    path('patient-profile/', patient_views.patient_profile_data, name='patient-profile'),
    path('patient-change-password/', patient_views.patient_change_password, name='patient_change_password'),
    ## patient data 
    path('get-weight-record/', patient_views.get_weight_record, name='get weight record'),
    path('record_weight/', patient_views.record_weight, name='record weight'), 
    path('get-patient-notes/', patient_views.get_patient_notes, name='get patient notes'),
    ## reminders 
    path('get-reminders/', patient_reminder_views.get_reminders, name='get_reminders'),
    path('add-reminder/', patient_reminder_views.add_reminder, name='add_reminder'),
    path('save-reminder/', patient_reminder_views.save_reminder, name='save_reminder'),
    path('delete-reminder/<int:id>/', patient_reminder_views.delete_reminder, name='delete_reminder'),

    # endpoints used by provider interface 
    path('get-auth-status', provider_views.get_auth_status, name='get_auth_status'), 
    path('get-csrf-token/', provider_views.get_csrf_token, name='get_csrf_token'),
    path('register-provider/', provider_views.register_provider, name='register_provider'), 
    path('profile/', provider_views.profile_data, name='profile'),
    path('dashboard/', provider_views.dashboard, name='dashboard'), 
    path('get-patient-data/', provider_views.get_patient_data, name='get_patient_data'),
    path('add-patient-note', provider_views.add_patient_note, name='add_patient_note'), 
    path('add-patient-info', provider_views.add_patient_info, name='add_patient_info'), 
    path('get-provider-notifications/', provider_views.get_provider_notifications, name='get_provider_notifications'), 
    path('mark-notification-as-read/<int:id>/', provider_views.mark_notification_as_read, name='mark_notification_as_read'), 
]