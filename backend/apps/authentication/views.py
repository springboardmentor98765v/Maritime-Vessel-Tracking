# apps/authentication/views.py

from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

# ===========================
# REGISTER API FOR REACT FRONTEND
# ===========================
@method_decorator(csrf_exempt, name='dispatch')  # Allows React POST without CSRF
class RegisterAPIView(APIView):
    """
    POST /accounts/register/
    Body: JSON { username, email, password1, password2, role }
    Returns JSON response with success or error message
    """
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password1 = request.data.get("password1")
        password2 = request.data.get("password2")
        role = request.data.get("role")  # optional, can save in profile

        # Basic validation
        if not username or not password1 or not password2:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        if password1 != password2:
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        # Create user
        user = User.objects.create_user(username=username, email=email, password=password1)

        # Assign role from frontend dropdown
        if role == "admin":
            user.is_superuser = True
        elif role == "operator":
            user.is_staff = True

        user.save()

        return Response({"detail": "User registered successfully ✅"}, status=status.HTTP_201_CREATED)

# ===========================
# GET CURRENT USER INFO (JWT)
# ===========================
class MeAPIView(APIView):
    """
    GET /api/me/
    Headers: Authorization: Bearer <access_token>
    Returns current user info
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            
        })

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Map Django User flags to roles
        if request.user.is_superuser:
            role = "admin"
        elif request.user.is_staff:
            role = "operator"
        else:
            role = "analyst"

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": role
        })

    def patch(self, request):
        user = request.user

        username = request.data.get("username")
        email = request.data.get("email")

        if username:
            user.username = username

        if email:
            user.email = email

        user.save()

        return Response({
            "username": user.username,
            "email": user.email
        })


from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.http import JsonResponse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get("email")

    try:
        user = User.objects.get(email=email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"

        send_mail(
            "Password Reset",
            f"Click here to reset your password: {reset_link}",
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )

        return Response({"message": "Reset link sent to email"})

    except User.DoesNotExist:
        return Response({"error": "User not found"})
    


from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
def reset_password(request, uid, token):
    try:
        uid = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=uid)

        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "Invalid or expired reset link"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_password = request.data.get("password")

        if not new_password:
            return Response(
                {"error": "Password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password reset successful"})

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)