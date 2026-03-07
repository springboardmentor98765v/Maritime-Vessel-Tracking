from django.urls import path
from .views import (
    VesselListView,
    VesselEventListView,
    NotificationListView,
    TriggerEventView
)

urlpatterns = [

    path("", VesselListView.as_view()),

    path("events/", VesselEventListView.as_view()),

    path("notifications/", NotificationListView.as_view()),

    path("detect-events/", TriggerEventView.as_view()),

]