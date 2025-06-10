from rest_framework import serializers
from .models import UserPreference

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = '__all__'

    def validate_email(self, value):
        if not value or '@' not in value:
            raise serializers.ValidationError("Enter a valid email address")
        return value
    
    def validate_username(self, value):
        if not value or len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters")
        return value
    