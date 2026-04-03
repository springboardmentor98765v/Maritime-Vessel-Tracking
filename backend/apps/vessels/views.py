from rest_framework import viewsets
from .models import Vessel
from .serializers import VesselSerializer
from django.shortcuts import render

class VesselViewSet(viewsets.ModelViewSet):
    queryset = Vessel.objects.all().prefetch_related("positions").order_by("-id")
    serializer_class = VesselSerializer

def vessel_map(request):
    return render(request, 'map.html')