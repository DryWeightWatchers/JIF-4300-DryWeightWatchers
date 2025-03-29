from django.core.management.base import BaseCommand
from api.utils.email_utils import check_and_send_reminder_emails

class Command(BaseCommand):
    help = 'Check for reminders that are due and send emails'

    def handle(self, *args, **options):
        try:
            check_and_send_reminder_emails()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error checking reminders: {str(e)}')) 