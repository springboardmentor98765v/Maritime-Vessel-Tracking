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


class VoyageHistoryAPIView(APIView):
    """
    GET /voyages/{id}/history/
    Returns structured {voyage, waypoints} required by the frontend replay UI.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        from apps.voyages.models import Voyage
        from apps.vessels.models import VesselPosition, VesselEvent
        try:
            voyage = Voyage.objects.get(pk=pk)
            vessel = voyage.vessel
        except Voyage.DoesNotExist:
            return Response({'error': 'Voyage not found'}, status=404)

        history = []
        
        # 1. Fetch positions for this specific voyage
        positions = VesselPosition.objects.filter(vessel=vessel)
        if voyage.arrival_time:
            positions = positions.filter(timestamp__range=(voyage.departure_time, voyage.arrival_time))
        else:
            positions = positions.filter(timestamp__gte=voyage.departure_time)
        positions = positions.order_by('timestamp')
        
        import re
        def parse_loc(loc_str):
            if not loc_str: return 0.0, 0.0
            try:
                lat_part, lon_part = loc_str.split(',')
                lat = float(re.sub(r'[^\d.-]', '', lat_part))
                if 'S' in lat_part: lat = -lat
                lon = float(re.sub(r'[^\d.-]', '', lon_part))
                if 'W' in lon_part: lon = -lon
                return lat, lon
            except Exception:
                return 0.0, 0.0
        
        waypoints = []
        if voyage.port_from:
            plat, plon = parse_loc(voyage.port_from.location)
            waypoints.append({
                "lat": plat, "lon": plon,
                "type": "departure", "label": f"Depart {voyage.port_from.name}", 
                "time": voyage.departure_time.isoformat() if voyage.departure_time else ""
            })
            
        for pos in positions:
            waypoints.append({
                "lat": float(pos.latitude), "lon": float(pos.longitude),
                "type": "route", "label": "Position Update", 
                "time": pos.timestamp.isoformat() if pos.timestamp else ""
            })
            
        # 2. Fetch events for this voyage
        events = VesselEvent.objects.filter(vessel=vessel)
        if voyage.arrival_time:
            events = events.filter(timestamp__range=(voyage.departure_time, voyage.arrival_time))
        else:
            events = events.filter(timestamp__gte=voyage.departure_time)
            
        for ev in events:
            waypoints.append({
                "lat": float(vessel.last_position_lat) if vessel.last_position_lat else 0.0,
                "lon": float(vessel.last_position_lon) if vessel.last_position_lon else 0.0,
                "type": "event", "label": ev.event_type.upper(), 
                "details": ev.details,
                "time": ev.timestamp.isoformat() if ev.timestamp else ""
            })
            
        # Re-sort waypoints by time
        waypoints.sort(key=lambda x: x['time'])
        
        if voyage.port_to and voyage.status == 'completed':
            plat, plon = parse_loc(voyage.port_to.location)
            waypoints.append({
                "lat": plat, "lon": plon,
                "type": "arrival", "label": f"Arrive {voyage.port_to.name}", 
                "time": voyage.arrival_time.isoformat() if voyage.arrival_time else ""
            })

        return Response({
            "voyage": {
                "vessel_name": vessel.name,
                "port_from_name": voyage.port_from.name if voyage.port_from else 'Unknown',
                "port_to_name": voyage.port_to.name if voyage.port_to else 'Unknown'
            },
            "waypoints": waypoints
        })


class VoyageAuditAPIView(APIView):
    """
    GET /api/voyage/{id}/audit/
    Basic rules:
    - If event.type == "piracy_zone" or "piracy" -> flag risk
    - If port_wait_time (or port_delay event) > threshold -> flag delay
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        from apps.voyages.models import Voyage
        try:
            voyage = Voyage.objects.get(pk=pk)
        except Voyage.DoesNotExist:
            return Response({'error': 'Voyage not found'}, status=404)

        risk_flags = []
        delay = False

        vessel = voyage.vessel
        # Check vessel events during this voyage
        events_qs = vessel.events.all()
        if voyage.arrival_time:
            events_qs = events_qs.filter(
                timestamp__gte=voyage.departure_time,
                timestamp__lte=voyage.arrival_time
            )
        else:
            events_qs = events_qs.filter(timestamp__gte=voyage.departure_time)

        for ev in events_qs:
            # Audit rules
            if ev.event_type in ['piracy', 'piracy_zone', 'storm', 'accident']:
                risk_flags.append(ev.event_type)
            if ev.event_type == 'port_delay':
                delay = True

        # Check port wait times (simplified: just checking if departure - arrival > 2 days)
        # Actually the instruction says "If port_wait_time > threshold -> flag delay". 
        # Since we use `port_from` we can check its avg_wait_time
        if voyage.port_from and voyage.port_from.avg_wait_time and voyage.port_from.avg_wait_time > 24.0:
            delay = True

        return Response({
            "risk_flags": list(set(risk_flags)),
            "delay": delay
        })
