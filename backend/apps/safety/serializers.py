from rest_framework import serializers
from .models import SafetyZone

class SafetyZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = SafetyZone
        fields = '__all__'

