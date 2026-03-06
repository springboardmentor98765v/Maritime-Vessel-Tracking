from rest_framework import serializers
from .models import Vessel, VesselEvent, VesselSubscription


class VesselEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = VesselEvent
        fields = [
            'id', 'event_type', 'location',
            'latitude', 'longitude',
            'timestamp', 'details', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = [
            'id', 'imo_number', 'name', 'vessel_type', 'flag',
            'cargo_type', 'operator',
            'speed', 'heading', 'destination',
            'last_position_lat', 'last_position_lon',
            'last_update', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class VesselSubscriptionSerializer(serializers.ModelSerializer):
    vessel = VesselSerializer(read_only=True)

    class Meta:
        model = VesselSubscription
        fields = ['id', 'vessel', 'created_at']
        read_only_fields = ['id', 'created_at']
