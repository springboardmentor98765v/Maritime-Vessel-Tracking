from django.urls import path
from .views import (
    VesselListView,
    VesselDetailView,
    VesselEventListView,
    NotificationListView,
    SubscribeVesselView,
    UnsubscribeVesselView,
    TriggerVesselUpdateView
)

urlpatterns = [
    path('', VesselListView.as_view()),
    path('<int:pk>/', VesselDetailView.as_view()),
    path('events/', VesselEventListView.as_view()),
    path('notifications/', NotificationListView.as_view()),
    path('subscribe/<int:vessel_id>/', SubscribeVesselView.as_view()),
    path('unsubscribe/<int:vessel_id>/', UnsubscribeVesselView.as_view()),
    path('update/', TriggerVesselUpdateView.as_view()),
]