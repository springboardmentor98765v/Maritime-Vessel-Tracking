from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta

from .serializers import RegisterSerializer
from .models import User


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class CustomLoginView(TokenObtainPairView):

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"status": "error", "message": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 🔒 Account lock logic
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

        # ✅ Successful login
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