from django.db import models
from django.contrib.auth.models import User
from apps.vessels.models import Vessel
from apps.safety.models import Safety

EVENT_TYPES = [
    ('STOPPED', 'Vessel Stopped'),
    ('MOVED', 'Vessel Started Moving'),
    ('ROUTE_CHANGED', 'Vessel Route Changed'),
    ('PORT_ENTERED', 'Vessel Entered Port'),
    ('PORT_DEPARTED', 'Vessel Departed Port'),
    ('STORM_ALERT', 'Storm Detection'),
    ('CYCLONE_ALERT', 'Cyclone Detection'),
    ('PIRACY_ZONE_ALERT', 'Piracy Zone Detection'),
    ('SAFETY_ALERT', 'General Safety Alert'),
    ('CONGESTION_ALERT', 'Port Congestion Alert'),
]

class Event(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name="events")
    event_type = models.CharField(max_length=100, choices=EVENT_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    details = models.TextField(null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=['vessel', 'timestamp']),
            models.Index(fields=['event_type']),
        ]

    def __str__(self):
        return f"{self.vessel.name} - {self.event_type} @ {self.timestamp}"

class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscriptions")
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name="subscriptions")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'vessel'], name='uq_subscription_user_vessel')
        ]
        indexes = [
            models.Index(fields=['user', 'vessel'], name='idx_sub_user_vessel'),
            models.Index(fields=['vessel', 'user'], name='idx_sub_vessel_user'),
        ]

    def __str__(self):
        return f"{self.user.username} subscribed to {self.vessel.name}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications", db_index=True)
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, null=True, blank=True, related_name="vessel_notifications", db_index=True)
    safety_event = models.ForeignKey(Safety, on_delete=models.CASCADE, null=True, blank=True, related_name="safety_event_notifications", db_index=True)
    tracking_event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True, related_name="tracking_event_notifications", db_index=True)
    
    message = models.TextField()
    type = models.CharField(max_length=50, default="info", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    is_read = models.BooleanField(default=False, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "is_read", "-created_at"], name="idx_n_u_r_ca"),
            models.Index(fields=["user", "-created_at"], name="idx_n_u_ca"),
        ]

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}"