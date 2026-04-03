from django.urls import path
from .views import SafetyAlertsView, SafetyZoneListView

urlpatterns = [
    path('alerts/', SafetyAlertsView.as_view(), name='safety-alerts'),
    path('zones/', SafetyZoneListView.as_view(), name='safety-zones'),
]