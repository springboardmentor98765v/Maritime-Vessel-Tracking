from rest_framework import generics
from .serializers import VesselSerializer
from .models import Vessel
from django.shortcuts import render

class VesselList(generics.ListCreateAPIView):
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer

def vessel_map(request):
    return render(request, 'map.html')