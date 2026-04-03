from rest_framework import serializers
from .models import Voyage, VoyageHistory, Compliance

class VoyageHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VoyageHistory
        fields = "__all__"

class ComplianceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compliance
        fields = "__all__"

class VoyageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voyage
        fields = "__all__"

class VoyageDetailSerializer(serializers.ModelSerializer):
    history = VoyageHistorySerializer(many=True, read_only=True)
    compliance = ComplianceSerializer(read_only=True)

    class Meta:
        model = Voyage
        fields = "__all__"
