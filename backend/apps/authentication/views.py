from django.shortcuts import render
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
import logging
import random
import string

logger = logging.getLogger(__name__)

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import timedelta
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import User, UserProfile, OTP
from .permissions import IsAdmin
from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    PasswordResetSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
)


# =========================
# AUTH & REGISTRATION
# =========================

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print("REGISTER ERRORS:", serializer.errors)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()

        # Generate JWT tokens so the frontend can log the user in immediately
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "detail": "User registered successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "username": user.username,
                "role": user.role,
            },
            status=status.HTTP_201_CREATED
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"})
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# =========================
# ADMIN
# =========================

class AdminView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdmin]


# =========================
# USER PROFILE (AUTH USER)
# =========================

class ProfileMeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user

            if not user.check_password(serializer.validated_data["old_password"]):
                return Response(
                    {"old_password": "Wrong password"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(serializer.validated_data["new_password"])
            user.save()

            return Response(
                {"detail": "Password updated successfully"},
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================
# USER PROFILE (EXTENDED)
# =========================

class UpdateUserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        """Fetch profile data for auto-fill"""
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Update profile data"""
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )
        if not serializer.is_valid():
            print("Profile Update Errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


# =========================
# PASSWORD RESET
# =========================

class PasswordResetView(APIView):
    """Request a password reset email."""
    
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            
            try:
                user = User.objects.get(email=email)
                
                # Generate token and UID
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Build reset link (adjust frontend URL as needed)
                reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/" if hasattr(settings, 'FRONTEND_URL') else f"http://localhost:5173/reset-password/{uid}/{token}/"
                
                # Send email
                subject = "Reset Your Maritime Vista Password"
                html_message = f"""
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <p><a href="{reset_link}">Reset Password</a></p>
                <p>This link expires in 24 hours.</p>
                <p>If you didn't request this, ignore this email.</p>
                """
                
                try:
                    send_mail(
                        subject,
                        f"Reset link: {reset_link}",
                        settings.DEFAULT_FROM_EMAIL,
                        [email],
                        html_message=html_message,
                        fail_silently=False,
                    )
                except Exception as exc:
                    # Log the exception so SMTP/auth issues are visible in the console
                    logger.exception("Failed to send password reset email: %s", exc)
            except User.DoesNotExist:
                pass  # Don't reveal if user exists
            
            return Response(
                {"detail": "If that email exists, reset instructions will be sent."},
                status=status.HTTP_200_OK
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token and set new password."""
    
    def post(self, request):
        from django.utils.http import urlsafe_base64_decode
        
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        
        if not all([uid, token, new_password]):
            return Response(
                {"error": "Missing uid, token, or new_password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from django.contrib.auth.password_validation import validate_password
            validate_password(new_password)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
            
            if not default_token_generator.check_token(user, token):
                return Response(
                    {"error": "Invalid or expired token"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(new_password)
            user.save()
            
            return Response(
                {"detail": "Password reset successfully"},
                status=status.HTTP_200_OK
            )
        except (TypeError, ValueError, User.DoesNotExist):
            return Response(
                {"error": "Invalid reset link"},
                status=status.HTTP_400_BAD_REQUEST
            )


# =========================
# OTP VERIFICATION
# =========================

def generate_otp():
    """Generate a random 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))


class SendOTPView(APIView):
    """Send OTP to user email for verification"""
    
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data["email"]
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            # Delete old OTPs for this email
            OTP.objects.filter(email=email).delete()
            
            # Generate new OTP
            otp = generate_otp()
            expires_at = timezone.now() + timedelta(minutes=10)
            
            # Save OTP
            OTP.objects.create(email=email, otp=otp, expires_at=expires_at)
            
            # Send email with OTP
            subject = "Your Password Reset OTP"
            message = f"Your OTP for password reset is: {otp}\n\nThis OTP is valid for 10 minutes."
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
            except Exception as e:
                logger.exception("Failed to send OTP email: %s", e)
            
            return Response(
                {"detail": "OTP sent to email"},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            # Don't reveal if user exists
            return Response(
                {"detail": "If that email exists, an OTP will be sent."},
                status=status.HTTP_200_OK
            )


class VerifyOTPView(APIView):
    """Verify OTP and return a temporary token for password reset"""
    
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]
        
        try:
            # Get the latest OTP for this email
            otp_obj = OTP.objects.filter(email=email).latest('created_at')
            
            if not otp_obj.is_valid():
                otp_obj.delete()
                return Response(
                    {"error": "OTP has expired"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if otp_obj.otp != otp:
                return Response(
                    {"error": "Invalid OTP"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # OTP is valid, delete it
            otp_obj.delete()
            
            # Return success with email for password reset
            return Response(
                {"detail": "OTP verified successfully", "email": email},
                status=status.HTTP_200_OK
            )
        except OTP.DoesNotExist:
            return Response(
                {"error": "No OTP found for this email"},
                status=status.HTTP_400_BAD_REQUEST
            )


class ResetPasswordOTPView(APIView):
    """Reset password after OTP verification"""
    
    def post(self, request):
        email = request.data.get("email")
        new_password = request.data.get("new_password")
        
        if not email or not new_password:
            return Response(
                {"error": "Email and new_password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from django.contrib.auth.password_validation import validate_password
            validate_password(new_password)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            
            return Response(
                {"detail": "Password reset successfully"},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_400_BAD_REQUEST
            )

