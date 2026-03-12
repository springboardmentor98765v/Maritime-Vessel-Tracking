from rest_framework import serializers
from .models import SafetyEvent


class SafetyEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SafetyEvent
        fields = [
            'id', 'event_type', 'title', 'description', 'severity',
            'latitude', 'longitude', 'radius_nm',
            'source', 'active_from', 'active_until', 'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
