from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
import random

from .serializers import RegisterSerializer, UserListSerializer
from .models import User


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class CustomLoginView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        login_str = request.data.get("username")
        password = request.data.get("password")

        user = User.objects.filter(Q(username=login_str) | Q(email=login_str)).first()
        
        if not user:
            return Response(
                {"status": "error", "message": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # To work correctly with authenticate(), we need the actual username
        username = user.username

        # Account lock logic
        if user.is_locked:
            if user.lock_time:
                unlock_time = user.lock_time + timedelta(minutes=15)
                if timezone.now() > unlock_time:
                    user.is_locked = False
                    user.failed_login_attempts = 0
                    user.lock_time = None
                    user.save()
                else:
                    return Response(
                        {"status": "error", "message": "Account locked. Try again later."},
                        status=status.HTTP_403_FORBIDDEN
                    )

        user_auth = authenticate(username=username, password=password)

        if user_auth is None:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 3:
                user.is_locked = True
                user.lock_time = timezone.now()
            user.save()

            return Response(
                {"status": "error", "message": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Successful login
        user.failed_login_attempts = 0
        user.lock_time = None
        user.is_locked = False
        user.save()

        token_response = super().post(request, *args, **kwargs)

        return Response(
            {
                "status": "success",
                "message": "Login successful",
                "data": {
                    "user": {
                        "username": user.username,
                        "role": user.role,
                    },
                    "tokens": token_response.data,
                },
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "username": user.username,
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )


class UserListView(generics.ListAPIView):
    """
    Simple admin-only user list for the Users page.
    """

    queryset = User.objects.all().order_by("id")
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        new_password = request.data.get("new_password")

        if not all([email, new_password]):
            return Response({"message": "Email and new password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Reset Password directly without OTP
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password reset successful ✅"}, status=status.HTTP_200_OK)


class CheckEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"message": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Email found", "status": "success"}, status=status.HTTP_200_OK)