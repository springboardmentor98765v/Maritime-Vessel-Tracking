from rest_framework import serializers
from .models import Notification, Event, Subscription
from apps.vessels.serializers import VesselSerializer

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['user']

class NotificationSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source="vessel.name", read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'