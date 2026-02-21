from rest_framework import serializers
from .models import Voyage


class VoyageSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    port_from_name = serializers.CharField(source='port_from.name', read_only=True)
    port_to_name = serializers.CharField(source='port_to.name', read_only=True)

    class Meta:
        model = Voyage
        fields = [
            'id', 'vessel', 'vessel_name',
            'port_from', 'port_from_name',
            'port_to', 'port_to_name',
            'departure_time', 'arrival_time',
            'status', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
