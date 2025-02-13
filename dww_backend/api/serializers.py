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
      
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'shareable_id']