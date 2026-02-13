from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
            write_only=True,
            required=True,
            validators=[validate_password]
        )
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        required=True
    )

    class Meta:
        model = User
        fields = [
                    'username',
                    'password',
                    'email',
                    'first_name',
                    'last_name',
                    'role'
                ]
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        # Update last_login
        self.user.last_login = timezone.now()
        self.user.save(update_fields=['last_login'])

        # Add extra fields to response
        data['username'] = self.user.username
        data['role'] = self.user.role
        data['last_login'] = self.user.last_login

        return data
