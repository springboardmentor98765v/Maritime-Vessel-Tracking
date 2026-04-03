from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import get_port_analytics

class PortAnalyticsView(APIView):
    def get(self, request):
        analytics = get_port_analytics()
        return Response(analytics, status=status.HTTP_200_OK)

from rest_framework.generics import ListAPIView
from .models import Port
from .serializers import PortSerializer
class PortListView(ListAPIView):
    queryset = Port.objects.all().order_by('id')
    serializer_class = PortSerializer


class PortDetailAnalyticsView(APIView):
    def get(self, request, port_name):
        data = get_port_analytics()

        # find specific port
        for port in data:
            if port["port"].lower() == port_name.lower():
                return Response(port, status=status.HTTP_200_OK)

        return Response(
            {"error": "Port not found"},
            status=status.HTTP_404_NOT_FOUND
        )