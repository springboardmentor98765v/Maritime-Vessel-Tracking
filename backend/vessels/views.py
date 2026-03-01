from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Vessel, VesselEvent, VesselSubscription, Notification
from .serializers import (
    VesselSerializer,
    VesselEventSerializer,
    NotificationSerializer
)

from .services.vessel_updater import update_vessels


class VesselListView(generics.ListAPIView):
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    permission_classes = [IsAuthenticated]


class VesselDetailView(generics.RetrieveAPIView):
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    permission_classes = [IsAuthenticated]


class VesselEventListView(generics.ListAPIView):
    queryset = VesselEvent.objects.all()
    serializer_class = VesselEventSerializer
    permission_classes = [IsAuthenticated]


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class SubscribeVesselView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, vessel_id):
        vessel = Vessel.objects.get(id=vessel_id)
        VesselSubscription.objects.get_or_create(
            user=request.user,
            vessel=vessel
        )
        return Response({"message": "Subscribed successfully"})


class UnsubscribeVesselView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, vessel_id):
        VesselSubscription.objects.filter(
            user=request.user,
            vessel_id=vessel_id
        ).delete()
        return Response({"message": "Unsubscribed successfully"})


class TriggerVesselUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        update_vessels()
        return Response({"status": "Vessel data updated"})