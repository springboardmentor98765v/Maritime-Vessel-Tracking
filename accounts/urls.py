from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('auth/', views.unified_login_register, name='unified_auth'),
]
