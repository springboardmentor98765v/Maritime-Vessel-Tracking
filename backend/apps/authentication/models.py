from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):

    ROLE_CHOICES = [
        ('operator', 'Operator'),
        ('analyst', 'Analyst'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)







class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    company = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)


class OTP(models.Model):
    email = models.EmailField(unique=False)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']

    def is_valid(self):
        return timezone.now() < self.expires_at
    
    def __str__(self):
        return f"OTP for {self.email}"
