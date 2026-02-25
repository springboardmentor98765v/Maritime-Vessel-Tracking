from django.db.models import Avg, Count
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Port
from .serializers import PortSerializer


class PortListView(generics.ListAPIView):
    """GET /ports/ — List all ports. Optional filter: ?country=&name="""
    serializer_class = PortSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Port.objects.all()
        name = self.request.query_params.get('name')
        country = self.request.query_params.get('country')
        if name:
            qs = qs.filter(name__icontains=name)
        if country:
            qs = qs.filter(country__iexact=country)
        return qs


class PortDetailView(generics.RetrieveAPIView):
    """GET /ports/<pk>/ — Single port details."""
    serializer_class = PortSerializer
    queryset = Port.objects.all()
    permission_classes = [AllowAny]


class PortCongestionDashboardView(APIView):
    """
    GET /ports/congestion/
    Returns ports ranked by congestion score (highest first).
    Adds a human-readable congestion level: low / moderate / high / critical.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        ports = Port.objects.all().order_by('-congestion_score')
        data = []
        for p in ports:
            score = p.congestion_score
            if score >= 80:
                level = 'critical'
            elif score >= 60:
                level = 'high'
            elif score >= 35:
                level = 'moderate'
            else:
                level = 'low'

            data.append({
                'id': p.id,
                'name': p.name,
                'country': p.country,
                'location': p.location,
                'congestion_score': score,
                'congestion_level': level,
                'avg_wait_time': p.avg_wait_time,
                'arrivals': p.arrivals,
                'departures': p.departures,
                'last_update': p.last_update,
                'alert': score >= 80,
            })

        return Response(data)
class PortAnalyticsView(APIView):
    """
    GET /ports/analytics/
    Returns aggregate data for charts: top congested ports, averages, counts.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from apps.vessels.models import Vessel
        from apps.voyages.models import Voyage
        from apps.vessels.models import VesselEvent

        ports = Port.objects.all()
        total_ports = ports.count()
        avg_congestion = ports.aggregate(avg=Avg('congestion_score'))['avg'] or 0

        # Top 10 ports by congestion score
        top_ports = list(
            ports.order_by('-congestion_score')[:10].values(
                'name', 'country', 'congestion_score', 'avg_wait_time'
            )
        )

        # Vessel type breakdown
        vessel_types = list(
            Vessel.objects.values('type')
            .annotate(count=Count('id'))
            .order_by('-count')[:8]
        )

        # Voyage status breakdown
        voyage_statuses = list(
            Voyage.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Event type breakdown
        event_types = list(
            VesselEvent.objects.values('event_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            'summary': {
                'total_vessels': Vessel.objects.count(),
                'total_ports': total_ports,
                'total_voyages': Voyage.objects.count(),
                'total_events': VesselEvent.objects.count(),
                'avg_congestion_score': round(avg_congestion, 1),
            },
            'top_congested_ports': top_ports,
            'vessel_type_breakdown': vessel_types,
            'voyage_status_breakdown': voyage_statuses,
            'event_type_breakdown': event_types,
        })
