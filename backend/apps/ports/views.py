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
    Also triggers notifications for high/critical congestion ports.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        ports = Port.objects.all().order_by('-congestion_score')
        data = []
        critical_ports = []
        for p in ports:
            score = p.congestion_score
            if score >= 80:
                level = 'critical'
                critical_ports.append(p)
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

        # Trigger congestion notifications for critical ports
        _trigger_congestion_notifications(critical_ports)

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
            Vessel.objects.values('vessel_type')
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


class PortDetailAnalyticsView(APIView):
    """
    GET /ports/<pk>/analytics/
    Returns congestion analytics for a single port, including recent traffic history.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        import sys, os
        backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if backend_root not in sys.path:
            sys.path.insert(0, backend_root)
        from services.port_analytics_service import calculate_congestion_score, get_congestion_level
        from .models import PortTrafficHistory

        try:
            port = Port.objects.get(pk=pk)
        except Port.DoesNotExist:
            return Response({'error': 'Port not found'}, status=404)

        # Real-time calc from stored data
        score = calculate_congestion_score(port.arrivals, port.departures)
        level = get_congestion_level(score)

        # Stamp analytics update time so last_analytics_update never stays null
        from django.utils import timezone as tz
        port.last_analytics_update = tz.now()
        port.save(update_fields=['last_analytics_update'])

        # Traffic history (last 30 records)
        history = list(
            PortTrafficHistory.objects.filter(port=port)
            .order_by('-timestamp')[:30]
            .values('timestamp', 'arrivals', 'departures', 'congestion_score')
        )

        return Response({
            'port': {
                'id': port.id,
                'name': port.name,
                'country': port.country,
                'location': port.location,
            },
            'congestion_score': score,
            'congestion_level': level,
            'arrivals': port.arrivals,
            'departures': port.departures,
            'avg_wait_time': port.avg_wait_time,
            'last_update': port.last_update,
            'last_analytics_update': port.last_analytics_update,
            'traffic_history': history,
        })


# ─── Notification Helpers ─────────────────────────────────────────────────────

def _trigger_congestion_notifications(critical_ports: list):
    """Create notifications for users subscribed to vessels destined for critical-congestion ports."""
    if not critical_ports:
        return
    try:
        from apps.notifications.models import Notification
        from apps.vessels.models import Vessel
        from django.utils import timezone
        from datetime import timedelta

        for port in critical_ports:
            # Find vessels heading to this port
            vessels_at_port = Vessel.objects.filter(destination__icontains=port.name)
            cutoff = timezone.now() - timedelta(hours=1)

            for vessel in vessels_at_port:
                subs = vessel.subscribers.select_related('user')
                message = (
                    f"Port Congestion Alert: {port.name} is critically congested "
                    f"(score: {port.congestion_score}). "
                    f"Vessel {vessel.name} is heading there."
                )
                for sub in subs:
                    # Avoid duplicate notifications within 1 hour
                    already = Notification.objects.filter(
                        user=sub.user,
                        vessel=vessel,
                        type='congestion_alert',
                        timestamp__gte=cutoff,
                        is_read=False,
                    ).exists()
                    if not already:
                        Notification.objects.create(
                            user=sub.user,
                            vessel=vessel,
                            message=message,
                            type='congestion_alert',
                        )
    except Exception:
        pass  # Notifications are best-effort; don't break the API response
