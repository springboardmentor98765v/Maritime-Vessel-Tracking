from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Port
from .serializers import PortSerializer


class PortListView(generics.ListAPIView):
    """GET /ports/ — List all ports. Optional filter: ?country=&name="""
    serializer_class = PortSerializer

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


class PortCongestionDashboardView(APIView):
    """
    GET /ports/congestion/
    Returns ports ranked by congestion score (highest first).
    Adds a human-readable congestion level: low / moderate / high / critical.
    """

    def get(self, request):
        ports = Port.objects.all().order_by('-congestion_score')
        data = []
        for p in ports:
            score = p.congestion_score
            if score >= 80:
                level = 'critical'
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

        return Response(data)
