from rest_framework import serializers
from .models import *
from datetime import datetime

class WeightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightRecord
        fields = ['weight']

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("Weight must be a positive number")
        return value
    
class ReminderSerializer(serializers.ModelSerializer):
    days = serializers.ListField(child=serializers.CharField())

    class Meta:
        model = PatientReminder
        fields = ['time', 'days']
    
    def validate_days(self, value):
        valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if any(day.strip() not in valid_days for day in value):
            raise serializers.ValidationError("Invalid day(s) provided.")
        return ", ".join(value)
    
    def validate_time(self, value):
        try:
            if isinstance(value, str):
                hours, minutes = map(int, value.split(':'))
                if not (0 <= hours <= 23 and 0 <= minutes <= 59):
                    raise serializers.ValidationError("Invalid time format. Hours must be between 0-23 and minutes between 0-59.")
                return datetime.strptime(value, '%H:%M').time()
            return value
        except (ValueError, TypeError):
            raise serializers.ValidationError("Invalid time format. Expected HH:MM format.")

class PatientInfoSerializer(serializers.ModelSerializer):
    height = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    sex = serializers.ChoiceField(choices=PatientInfo.SEX_CHOICES, required=False, allow_null=True)
    medications = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    other_info = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    alarm_threshold = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True) 
    class Meta:
        model = PatientInfo
        fields = ['patient', 'height', 'date_of_birth', 'sex', 'medications', 'other_info', 'alarm_threshold']
      
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'shareable_id']

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['push_notifications', 'email_notifications']