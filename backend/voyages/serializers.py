from rest_framework import serializers
from .models import Voyage, VoyageHistory, Compliance


class VoyageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Voyage
        fields = "__all__"


class VoyageHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = VoyageHistory
        fields = "__all__"


class ComplianceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Compliance
        fields = "__all__"