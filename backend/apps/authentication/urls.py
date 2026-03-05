from django.urls import path
from .views import (
    RegisterView,
    LogoutView,
    CustomTokenObtainPairView,
    ChangePasswordView,
    ProfileMeView,
    UpdateUserProfileView,
    PasswordResetView,
    PasswordResetConfirmView,
    SendOTPView,
    VerifyOTPView,
    ResetPasswordOTPView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', CustomTokenObtainPairView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
    path('logout/', LogoutView.as_view(), name='logout'),  
    path('profile/me/', ProfileMeView.as_view()),
    path('profile/change_password/', ChangePasswordView.as_view()),
    path('profile/extra/', UpdateUserProfileView.as_view()),
    path('password-reset/', PasswordResetView.as_view()),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view()),
    path('send-otp/', SendOTPView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('reset-password-otp/', ResetPasswordOTPView.as_view()),
]
