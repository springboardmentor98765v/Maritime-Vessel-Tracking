from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Voyage, VoyageHistory, Compliance
from .serializers import VoyageSerializer
from vessels.models import VesselEvent


class VoyageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        voyages = Voyage.objects.all()

        serializer = VoyageSerializer(voyages, many=True)

        return Response(serializer.data)


class VesselVoyageHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, vessel_id):
        voyages = Voyage.objects.filter(vessel_id=vessel_id).order_by("-start_time")
        if not voyages.exists():
            return Response([], status=status.HTTP_200_OK)

        timeline = []

        voyage_ids = voyages.values_list("id", flat=True)
        points = VoyageHistory.objects.filter(voyage_id__in=voyage_ids).order_by("timestamp")
        for p in points:
            timeline.append(
                {
                    "lat": p.latitude,
                    "lon": p.longitude,
                    "time": p.timestamp,
                    "type": "position",
                    "voyage_id": p.voyage_id,
                }
            )

        events = VesselEvent.objects.filter(vessel_id=vessel_id).order_by("timestamp")
        for e in events:
            timeline.append(
                {
                    "event": e.event_type,
                    "time": e.timestamp,
                    "type": "event",
                    "details": e.details,
                    "lat": e.latitude,
                    "lon": e.longitude,
                }
            )

        timeline.sort(key=lambda x: x.get("time"))
        return Response(timeline, status=status.HTTP_200_OK)


class VoyageAuditView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, voyage_id):
        try:
            voyage = Voyage.objects.get(id=voyage_id)
        except Voyage.DoesNotExist:
            return Response({"detail": "Voyage not found."}, status=status.HTTP_404_NOT_FOUND)

        voyage_events = VesselEvent.objects.filter(vessel=voyage.vessel).order_by("-timestamp")
        flags = []

        event_names = [e.event_type.lower() for e in voyage_events]
        if any("piracy" in n for n in event_names):
            flags.append("piracy_zone")
        if any("storm" in n for n in event_names):
            flags.append("storm_zone")

        delay = False
        if voyage.end_time is not None:
            total_hours = (voyage.end_time - voyage.start_time).total_seconds() / 3600.0
            delay = total_hours > 96

        return Response(
            {
                "voyage_id": voyage.id,
                "risk_flags": flags,
                "delay": delay,
            },
            status=status.HTTP_200_OK,
        )