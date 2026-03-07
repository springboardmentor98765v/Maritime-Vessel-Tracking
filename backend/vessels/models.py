from django.db import models
from django.conf import settings


class Vessel(models.Model):

    name = models.CharField(max_length=255)
    imo_number = models.CharField(max_length=50, unique=True)
    mmsi = models.CharField(max_length=50, unique=True)

    vessel_type = models.CharField(max_length=100, blank=True, null=True)
    cargo_type = models.CharField(max_length=100, blank=True, null=True)
    flag = models.CharField(max_length=100, blank=True, null=True)

    latitude = models.FloatField()
    longitude = models.FloatField()

    speed = models.FloatField(default=0)
    course = models.FloatField(default=0)

    last_signal_time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class VesselEvent(models.Model):

    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)


class VesselSubscription(models.Model):

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    vessel_event = models.ForeignKey(VesselEvent, on_delete=models.CASCADE)

    message = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)