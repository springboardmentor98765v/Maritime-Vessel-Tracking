from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.voyages.models import Voyage
from apps.voyages.serializers import VoyageSerializer


class VoyageListView(generics.ListAPIView):
    """
    GET /voyages/
    Filter by ?vessel=<id>, ?status=<status>, ?port_from=<id>, ?port_to=<id>
    """
    serializer_class = VoyageSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Voyage.objects.select_related('vessel', 'port_from', 'port_to').all()
        vessel = self.request.query_params.get('vessel')
        voyage_status = self.request.query_params.get('status')
        port_from = self.request.query_params.get('port_from')
        port_to = self.request.query_params.get('port_to')
        if vessel:
            qs = qs.filter(vessel_id=vessel)
        if voyage_status:
            qs = qs.filter(status__iexact=voyage_status)
        if port_from:
            qs = qs.filter(port_from_id=port_from)
        if port_to:
            qs = qs.filter(port_to_id=port_to)
        return qs


class VoyageDetailView(generics.RetrieveAPIView):
    """GET /voyages/<pk>/"""
    serializer_class = VoyageSerializer
    permission_classes = [AllowAny]
    queryset = Voyage.objects.select_related('vessel', 'port_from', 'port_to').all()
    permission_classes = [AllowAny]


class VoyageReplayView(APIView):
    """
    GET /voyages/<pk>/replay/
    Returns an ordered list of waypoints for a voyage replay animation.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            voyage = Voyage.objects.select_related(
                'vessel', 'port_from', 'port_to'
            ).get(pk=pk)
        except Voyage.DoesNotExist:
            return Response({'detail': 'Voyage not found.'}, status=404)

        # Build waypoints list
        waypoints = []

        # 1. Departure port (use vessel's last known position as origin if port has no coords)
        port_from = voyage.port_from
        waypoints.append({
            'type': 'departure',
            'label': f'{port_from.name}, {port_from.country}',
            'timestamp': voyage.departure_time,
            # We store lat/lon in events; use a placeholder if port has none
            'lat': None,
            'lon': None,
        })

        # 2. Any vessel events during the voyage window
        vessel = voyage.vessel
        events_qs = vessel.events.all().order_by('timestamp')
        if voyage.arrival_time:
            events_qs = events_qs.filter(
                timestamp__gte=voyage.departure_time,
                timestamp__lte=voyage.arrival_time
            )
        else:
            events_qs = events_qs.filter(timestamp__gte=voyage.departure_time)

        for ev in events_qs:
            waypoints.append({
                'type': 'event',
                'label': f'{ev.event_type}: {ev.location or "en route"}',
                'timestamp': ev.timestamp,
                'lat': vessel.last_position_lat,
                'lon': vessel.last_position_lon,
                'event_type': ev.event_type,
                'details': ev.details,
            })

        # 3. Arrival port
        port_to = voyage.port_to
        waypoints.append({
            'type': 'arrival',
            'label': f'{port_to.name}, {port_to.country}',
            'timestamp': voyage.arrival_time,
            'lat': None,
            'lon': None,
        })

        return Response({
            'voyage': VoyageSerializer(voyage).data,
            'waypoints': waypoints,
            'vessel_last_lat': vessel.last_position_lat,
            'vessel_last_lon': vessel.last_position_lon,
        })
