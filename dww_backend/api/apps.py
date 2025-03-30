from django.apps import AppConfig
from .utils.scheduler import start_reminder_scheduler


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Start the reminder scheduler
        start_reminder_scheduler()
