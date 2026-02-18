from rest_framework import serializers
from .models import User,UserProfile
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model

User = get_user_model()

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

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)




class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        # authenticate username + password first
        data = super().validate(attrs)

        request = self.context.get("request")
        requested_role = request.data.get("role") if request else None

        if not requested_role:
            raise AuthenticationFailed("Role is required")

        # role stored in DB
        user_role = self.user.role

        if requested_role != user_role:
            raise AuthenticationFailed("Invalid role selected")

        # update last_login
        self.user.last_login = timezone.now()
        self.user.save(update_fields=['last_login'])

        # add extra fields to response
        data['username'] = self.user.username
        data['role'] = self.user.role
        data['last_login'] = self.user.last_login

        return data

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'company',
            'phone_number',
            'avatar',
            'bio',
        ] 


class ProfileSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            "profile"
        ]
        read_only_fields = ['username', 'role']





class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )


