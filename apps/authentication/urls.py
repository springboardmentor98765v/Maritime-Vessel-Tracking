# apps/authentication/urls.py
from django.urls import path
from .views import RegisterAPIView, MeAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import forgot_password, reset_password


urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),         # React registration
    path('me/', MeAPIView.as_view(), name='me'),                           # React get current user
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # React login (JWT)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),# Refresh JWT token
    path("forgot-password/", forgot_password),
    path("reset-password/<uid>/<token>/", reset_password),
]
