from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.vessels.models import Vessel
from .models import SafetyZone
from .serializers import SafetyZoneSerializer
from .services import detect_vessel_safety_risks

class SafetyAlertsView(APIView):
    def get(self, request):
        imo = request.query_params.get('imo')
        if not imo:
            return Response({"error": "IMO number required"}, status=status.HTTP_400_BAD_REQUEST)

        vessel = Vessel.objects.filter(imo_number=imo).first()
        if not vessel:
            return Response({"error": "Vessel not found"}, status=status.HTTP_404_NOT_FOUND)

        risks = detect_vessel_safety_risks(vessel, create_notifications=True)
        return Response(risks, status=status.HTTP_200_OK)

class SafetyZoneListView(APIView):
    def get(self, request):
        zones = SafetyZone.objects.all().order_by('-created_at')
        serializer = SafetyZoneSerializer(zones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)