from django.urls import path
from .views import export_voyages, export_events, get_logs, get_api_status

urlpatterns = [
    path('export/voyages/', export_voyages),
    path('export/events/', export_events),
    path('logs/', get_logs),
    path('api-status/', get_api_status),
]