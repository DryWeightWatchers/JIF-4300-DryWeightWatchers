from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from api.models import User, PatientReminder, NotificationPreference
from datetime import datetime, time
import pytz

def send_reminder_email(user: User, reminder: PatientReminder):
    """
    Send a reminder email to a user for their scheduled reminder.
    """
    subject = 'Dry Weight Watchers Reminder'
    
    # Create HTML content
    html_message = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <h1 style="color: #333; font-size: 24px;">Reminder: Record Your Dry Weight</h1>
              <p style="color: #555; font-size: 16px;">Don't forget to record your dry weight for today!</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 20px;">
              <p style="color: #666; font-size: 16px;">Scheduled for: {reminder.time}</p>
              <p style="color: #666; font-size: 16px;">Days: {reminder.days}</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-top: 20px; font-size: 14px; color: #999;">
              You can manage your notification preferences in the app settings.
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    from_email = settings.EMAIL_HOST_USER
    recipient_list = [user.email]

    try:
        send_mail(
            subject,
            '',
            from_email,
            recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
        print(f"Reminder email sent successfully to {user.email}")
        return True
    except Exception as e:
        print(f"Failed to send reminder email to {user.email}: {str(e)}")
        return False

def check_and_send_reminder_emails():
    """
    Check for reminders that are due and send emails to users who have email notifications enabled.
    """
    # Get current time in Eastern Time
    eastern = pytz.timezone('America/New_York')
    current_time = datetime.now(eastern)
    
    # Get all reminders for the current time
    current_hour = current_time.hour
    current_minute = current_time.minute
    
    # Get all users with email notifications enabled
    users_with_email = User.objects.filter(
        notification_preference__email_notifications=True,
        patient_reminders__isnull=False
    ).distinct()
    
    for user in users_with_email:
        # Get user's reminders for current time
        reminders = PatientReminder.objects.filter(
            patient=user,
            time__hour=current_hour,
            time__minute=current_minute
        )
        
        for reminder in reminders:
            send_reminder_email(user, reminder) 