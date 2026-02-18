from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')
def create(self, validated_data: dict):
    role = validated_data.pop('role', 'operator')
    password = validated_data.pop('password')

    user = User(**validated_data)
    user.role = role
    user.set_password(password)
    user.save()

    return user
    return user

