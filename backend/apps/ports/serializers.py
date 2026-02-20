from rest_framework import serializers
from .models import Port


class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Port
        fields = [
            'id', 'name', 'location', 'country',
            'congestion_score', 'avg_wait_time',
            'arrivals', 'departures', 'last_update',
        ]
        read_only_fields = ['id']
