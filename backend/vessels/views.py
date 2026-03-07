from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Vessel, VesselEvent, Notification
from .serializers import VesselSerializer, VesselEventSerializer, NotificationSerializer
from .services.vessel_service import detect_events


class VesselListView(ListAPIView):

    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    permission_classes = [IsAuthenticated]


class VesselEventListView(ListAPIView):

    queryset = VesselEvent.objects.all()
    serializer_class = VesselEventSerializer
    permission_classes = [IsAuthenticated]


class NotificationListView(ListAPIView):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notification.objects.filter(user=self.request.user)


class TriggerEventView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        vessels = Vessel.objects.all()

        for vessel in vessels:
            detect_events(vessel)

        return Response({"message": "Event detection executed"})