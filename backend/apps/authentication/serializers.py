from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone

from rest_framework import serializers

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile


User = get_user_model()


# =========================
# REGISTER SERIALIZER
# =========================

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
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "role",
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


# =========================
# JWT LOGIN SERIALIZER
# =========================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        # Authenticate username & password
        data = super().validate(attrs)

        # Update last login
        self.user.last_login = timezone.now()
        self.user.save(update_fields=["last_login"])

        # Add extra response data
        data["username"] = self.user.username
        data["role"] = self.user.role
        data["last_login"] = self.user.last_login

        return data


# =========================
# USER PROFILE SERIALIZER
# =========================

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "company",
            "phone_number",
            "avatar",
            "bio",
        ]
        extra_kwargs = {
            'company': {'required': False, 'allow_blank': True},
            'phone_number': {'required': False, 'allow_blank': True},
            'avatar': {'required': False, 'allow_null': True},
            'bio': {'required': False, 'allow_blank': True},
        }


# =========================
# USER + PROFILE SERIALIZER
# =========================

class ProfileSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "profile",
        ]
        read_only_fields = ["username", "role"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)

        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update or create UserProfile
        if profile_data is not None:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


# =========================
# CHANGE PASSWORD SERIALIZER
# =========================

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )


# =========================
# PASSWORD RESET SERIALIZER
# =========================

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    # Note: Don't validate existence here — the view handles it silently
    # (security best practice: never reveal if an email is registered)


# =========================
# OTP SERIALIZERS
# =========================

class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)
