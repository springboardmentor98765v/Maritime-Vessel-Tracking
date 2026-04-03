from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.vessels.models import VesselPosition
from apps.notifications.models import Event


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def voyage_history(request, vessel_id):
    positions = VesselPosition.objects.filter(
        vessel_id=vessel_id
    ).values("latitude", "longitude", "timestamp")

    events = Event.objects.filter(
        vessel_id=vessel_id
    ).values("event_type", "timestamp", "latitude", "longitude")

    timeline = []

    for p in positions:
        timeline.append({
            "lat": p["latitude"],
            "lon": p["longitude"],
            "time": p["timestamp"],
            "type": "position",
        })

    for e in events:
        timeline.append({
            "lat": e["latitude"],
            "lon": e["longitude"],
            "time": e["timestamp"],
            "type": e["event_type"],
        })

    timeline = sorted(timeline, key=lambda x: x["time"] or "")

    return Response(timeline)


@api_view(['GET'])
def voyage_audit(request, voyage_id):
    # This is where you'll eventually add the safety violation logic
    return Response({
        "voyage_id": voyage_id,
        "audit_status": "Completed",
        "message": "Voyage audit engine initialized successfully."
    })