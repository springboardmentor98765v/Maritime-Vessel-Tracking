from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, CustomLoginView, ProfileView, UserListView, ResetPasswordView, CheckEmailView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomLoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("check-email/", CheckEmailView.as_view(), name="check-email"),
]