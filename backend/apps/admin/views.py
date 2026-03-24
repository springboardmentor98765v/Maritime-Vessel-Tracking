from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import ApiLog
import csv
from django.http import HttpResponse
from apps.voyages.models import Voyage

class ApiStatusView(APIView):
    """GET /api/admin/api-status/"""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "marine_traffic": "working",
            "noaa": "working",
            "last_checked": timezone.now()
        })

class LogsView(APIView):
    """GET /api/admin/logs/"""
    permission_classes = [AllowAny]

    def get(self, request):
        logs = ApiLog.objects.all()[:50]
        data = [{
            "id": log.id,
            "source": log.source,
            "error_message": log.error_message,
            "timestamp": log.timestamp
        } for log in logs]
        return Response(data)

class ExportVoyagesView(APIView):
    """GET /api/admin/export/voyages/"""
    permission_classes = [AllowAny]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="voyages.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Vessel', 'Departure Port', 'Arrival Port', 'Departure Time', 'Arrival Time', 'Status'])

        for v in Voyage.objects.select_related('vessel', 'port_from', 'port_to').all().iterator():
            writer.writerow([
                v.id,
                v.vessel.name,
                v.port_from.name if v.port_from else '',
                v.port_to.name if v.port_to else '',
                v.departure_time,
                v.arrival_time,
                v.status
            ])

        return response
