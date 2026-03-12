from rest_framework import serializers
from .models import Port, PortTrafficHistory, SafetyZone, ExternalSafetyData


class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Port
        fields = [
            'id', 'name', 'location', 'country',
            'congestion_score', 'avg_wait_time',
            'last_analytics_update',
            'arrivals', 'departures',
            'last_update', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class PortTrafficHistorySerializer(serializers.ModelSerializer):
    """Milestone-3: Serializer for historical port traffic snapshots."""
    port_name = serializers.CharField(source='port.name', read_only=True)

    class Meta:
        model = PortTrafficHistory
        fields = [
            'id', 'port', 'port_name',
            'timestamp',
            'arrivals', 'departures',
            'congestion_score',
        ]
        read_only_fields = ['id']


class SafetyZoneSerializer(serializers.ModelSerializer):
    """Milestone-3: Serializer for safety risk zones (storms, piracy, accidents)."""

    class Meta:
        model = SafetyZone
        fields = [
            'id',
            'zone_type', 'severity',
            'latitude', 'longitude', 'radius',
            'description',
            'created_at', 'expires_at',
        ]
        read_only_fields = ['id', 'created_at']


class ExternalSafetyDataSerializer(serializers.ModelSerializer):
    """Milestone-3: Serializer for external staging data (NOAA, UNCTAD)."""

    class Meta:
        model = ExternalSafetyData
        fields = [
            'id',
            'source', 'raw_data', 'checksum',
            'status',
            'created_at', 'processed_at',
        ]
        read_only_fields = ['id', 'checksum', 'created_at']
