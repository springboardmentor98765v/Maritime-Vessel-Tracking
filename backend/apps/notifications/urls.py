from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, EventViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'notification-list', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
