import csv
from datetime import timedelta

from django.http import HttpResponse, JsonResponse
from django.utils import timezone

from apps.voyages.models import Voyage
from apps.notifications.models import Event
from apps.safety.models import ApiIntegrationLog


def export_voyages(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="voyages.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'Voyage ID',
        'Vessel Name',
        'Port From',
        'Port To',
        'Departure Time',
        'Arrival Time',
        'Status'
    ])

    voyages = Voyage.objects.select_related('vessel', 'port_from', 'port_to').all()

    for v in voyages:
        writer.writerow([
            v.id,
            v.vessel.name if v.vessel else "",
            v.port_from.name if v.port_from else "",
            v.port_to.name if v.port_to else "",
            v.departure_time,
            v.arrival_time,
            v.status,
        ])

    return response


def export_events(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="events.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'Event ID',
        'Vessel Name',
        'Event Type',
        'Timestamp',
        'Latitude',
        'Longitude'
    ])

    events = Event.objects.select_related('vessel').all()

    for e in events:
        writer.writerow([
            e.id,
            e.vessel.name if e.vessel else "",
            e.event_type,
            e.timestamp,
            e.latitude,
            e.longitude,
        ])

    return response


def get_logs(request):
    logs = ApiIntegrationLog.objects.all().order_by('-created_at')[:50]

    data = []
    for log in logs:
        data.append({
            "source": log.source,
            "endpoint": log.endpoint,
            "status": log.status,
            "message": log.message,
            "created_at": log.created_at,
        })

    return JsonResponse(data, safe=False)

from integrations.unctad import fetch_unctad_port_data
from integrations.noaa import fetch_noaa_safety_data

def get_api_status(request):

    fetch_unctad_port_data()
    fetch_noaa_safety_data()
    now = timezone.now()

    recent_cutoff = now - timedelta(hours=24)

    recent_logs = ApiIntegrationLog.objects.filter(created_at__gte=recent_cutoff)

    unctad_ok = recent_logs.filter(
        source__iexact="UNCTAD",
        status="success"
    ).exists()

    noaa_ok = recent_logs.filter(
        source__iexact="NOAA",
        status="success"
    ).exists()

    data = {
        "UNCTAD": "working" if unctad_ok else "failed",
        "NOAA": "working" if noaa_ok else "failed",
    }

    return JsonResponse(data)