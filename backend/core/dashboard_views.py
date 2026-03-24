from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Avg, Sum

class CompanyDashboardAPIView(APIView):
    """
    GET /api/dashboard/company/
    Return: active vessels count, delayed vessels, risk alerts count
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from apps.vessels.models import Vessel, VesselEvent
        from apps.voyages.models import Voyage

        # Active vessels (e.g. not stopped)
        active_vessels = Vessel.objects.exclude(speed__lte=0.5).count()

        # Delayed vessels (Vessels linked to Voyages with 'delayed' status, or port_delay events)
        delayed_vessels = Voyage.objects.filter(status__iexact='delayed').count()
        if delayed_vessels == 0:
            # Fallback to events if voyage status isn't explicitly 'delayed'
            delayed_vessels = VesselEvent.objects.filter(event_type='port_delay').values('vessel').distinct().count()

        # Risk alerts count (high/critical severity safety events, or piracy/storm vessel events)
        risk_alerts = VesselEvent.objects.filter(event_type__in=['piracy', 'storm', 'accident']).count()

        return Response({
            "active_vessels_count": active_vessels,
            "delayed_vessels": delayed_vessels,
            "risk_alerts_count": risk_alerts,
        })


class PortDashboardAPIView(APIView):
    """
    GET /api/dashboard/port/
    Return: congestion score, arrivals/departures, avg wait time (global average)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from apps.ports.models import Port
        
        aggregates = Port.objects.aggregate(
            avg_congestion=Avg('congestion_score'),
            total_arrivals=Sum('arrivals'),
            total_departures=Sum('departures'),
            avg_wait=Avg('avg_wait_time')
        )

        return Response({
            "congestion_score": round(aggregates['avg_congestion'] or 0, 1),
            "arrivals": aggregates['total_arrivals'] or 0,
            "departures": aggregates['total_departures'] or 0,
            "avg_wait_time": round(aggregates['avg_wait'] or 0, 1)
        })
