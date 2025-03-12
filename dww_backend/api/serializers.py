from rest_framework import serializers
from .models import *

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

class PatientInfoSerializer(serializers.ModelSerializer):
    height = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    sex = serializers.ChoiceField(choices=PatientInfo.SEX_CHOICES, required=False, allow_null=True)
    medications = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    other_info = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    class Meta:
        model = PatientInfo
        fields = ['patient', 'height', 'date_of_birth', 'sex', 'medications', 'other_info']
      
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'shareable_id']