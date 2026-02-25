from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Vessel, VesselEvent, VesselSubscription, SafetyEvent
from .serializers import VesselSerializer, VesselEventSerializer, VesselSubscriptionSerializer


class VesselListView(generics.ListAPIView):
    """
    GET /vessels/
    Optional query params: name, type, flag, cargo_type
    Returns all vessels (or filtered subset). Public read access.
    """
    serializer_class = VesselSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Vessel.objects.all()
        name = self.request.query_params.get('name')
        vessel_type = self.request.query_params.get('type')
        flag = self.request.query_params.get('flag')
        cargo_type = self.request.query_params.get('cargo_type')

        if name:
            qs = qs.filter(name__icontains=name)
        if vessel_type:
            qs = qs.filter(type__iexact=vessel_type)
        if flag:
            qs = qs.filter(flag__iexact=flag)
        if cargo_type:
            qs = qs.filter(cargo_type__iexact=cargo_type)

        return qs


class VesselDetailView(generics.RetrieveAPIView):
    """GET /vessels/<pk>/ — Full vessel metadata."""
    serializer_class = VesselSerializer
    queryset = Vessel.objects.all()
    permission_classes = [AllowAny]


class VesselPositionUpdateView(APIView):
    """
    POST /vessels/<pk>/position/
    Updates a vessel's lat/lon and last_update timestamp.
    Restricted to authenticated users (would be called by sync job).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            vessel = Vessel.objects.get(pk=pk)
        except Vessel.DoesNotExist:
            return Response({'error': 'Vessel not found'}, status=status.HTTP_404_NOT_FOUND)

        lat = request.data.get('lat')
        lon = request.data.get('lon')

        if lat is None or lon is None:
            return Response({'error': 'lat and lon are required'}, status=status.HTTP_400_BAD_REQUEST)

        from django.utils import timezone
        vessel.last_position_lat = float(lat)
        vessel.last_position_lon = float(lon)
        vessel.last_update = timezone.now()
        vessel.save(update_fields=['last_position_lat', 'last_position_lon', 'last_update'])

        return Response(VesselSerializer(vessel).data)


class VesselEventListView(generics.ListAPIView):
    """GET /vessels/<pk>/events/ — Events for a specific vessel."""
    serializer_class = VesselEventSerializer

    def get_queryset(self):
        return VesselEvent.objects.filter(vessel_id=self.kwargs['pk'])


class VesselSubscribeView(APIView):
    """
    POST   /vessels/<pk>/subscribe/   — Subscribe to vessel alerts
    DELETE /vessels/<pk>/subscribe/   — Unsubscribe
    GET    /vessels/subscriptions/    — List user's subscriptions
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            vessel = Vessel.objects.get(pk=pk)
        except Vessel.DoesNotExist:
            return Response({'error': 'Vessel not found'}, status=status.HTTP_404_NOT_FOUND)

        sub, created = VesselSubscription.objects.get_or_create(
            user=request.user, vessel=vessel
        )
        if not created:
            return Response({'detail': 'Already subscribed'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Subscribed successfully'}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        deleted, _ = VesselSubscription.objects.filter(
            user=request.user, vessel_id=pk
        ).delete()
        if deleted:
            return Response({'detail': 'Unsubscribed'}, status=status.HTTP_200_OK)
        return Response({'error': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)


class VesselSubscriptionListView(generics.ListAPIView):
    """GET /vessels/subscriptions/ — All vessels this user watches."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = VesselSubscriptionSerializer

    def get_queryset(self):
        return VesselSubscription.objects.filter(user=self.request.user).select_related('vessel')


class SafetyEventListView(generics.ListAPIView):
    """
    GET /vessels/safety-events/
    Returns active safety overlay events (piracy, storms, accidents).
    Supports ?type=piracy&severity=high&active_only=true
    """
    from .safety_serializers import SafetyEventSerializer
    serializer_class = SafetyEventSerializer

    def get_queryset(self):
        from .safety_serializers import SafetyEventSerializer
        from .models import SafetyEvent as SE
        qs = SE.objects.all()
        event_type = self.request.query_params.get('type')
        severity = self.request.query_params.get('severity')
        active_only = self.request.query_params.get('active_only', 'true')
        if event_type:
            qs = qs.filter(event_type=event_type)
        if severity:
            qs = qs.filter(severity=severity)
        if active_only.lower() == 'true':
            qs = qs.filter(is_active=True)
        return qs
