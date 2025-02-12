from rest_framework import serializers
from .models import WeightRecord, User

class WeightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightRecord
        fields = ['weight']

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("Weight must be a positive number")
        return value
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'shareable_id']