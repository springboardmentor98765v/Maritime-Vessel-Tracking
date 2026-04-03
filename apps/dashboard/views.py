from django.db.models import Q,F
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.voyages.models import Voyage
from apps.vessels.models import Vessel
from apps.notifications.models import Event
from apps.ports.models import Port
from apps.vessels.models import VesselRoute
from apps.voyages.models import VoyageHistory

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def company_dashboard(request):
    active_vessels = Vessel.objects.filter(speed__gt=0).count()

    delayed_vessels = VoyageHistory.objects.filter(
        arrival_time__gt=F("departure_time")
    ).distinct("vessel").count()

    risk_alerts = Event.objects.filter(
        event_type__in=["STORM_ALERT", "PIRACY_ALERT", "ROUTE_CHANGED", "STOPPED"]
    ).count()

    return Response({
        "active_vessels": active_vessels,
        "delayed_vessels": delayed_vessels,
        "risk_alerts": risk_alerts,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def port_dashboard(request):
    ports = Port.objects.all()

    total_ports = ports.count()
    avg_congestion = round(
        sum([float(p.congestion_score or 0) for p in ports]) / total_ports, 2
    ) if total_ports else 0

    total_arrivals = sum([int(p.arrivals or 0) for p in ports])
    total_departures = sum([int(p.departures or 0) for p in ports])
    avg_wait_time = round(
        sum([float(p.avg_wait_time or 0) for p in ports]) / total_ports, 2
    ) if total_ports else 0

    return Response({
        "total_ports": total_ports,
        "congestion_score": avg_congestion,
        "arrivals": total_arrivals,
        "departures": total_departures,
        "avg_wait_time": avg_wait_time,
    })