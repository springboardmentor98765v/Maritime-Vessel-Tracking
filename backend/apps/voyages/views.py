from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.voyages.models import Voyage
from apps.voyages.serializers import VoyageSerializer


class VoyageListView(generics.ListAPIView):
    """
    GET /voyages/
    Filter by ?vessel=<id>, ?status=<status>, ?port_from=<id>, ?port_to=<id>
    """
    serializer_class = VoyageSerializer

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
    queryset = Voyage.objects.select_related('vessel', 'port_from', 'port_to').all()
