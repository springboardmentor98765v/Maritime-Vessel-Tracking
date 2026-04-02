from rest_framework import serializers

from .models import Vessel, VesselEvent, Notification, Subscription


class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = "__all__"


class VesselEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = VesselEvent
        fields = "__all__"


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = "__all__"
        read_only_fields = ("user", "created_at")


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"