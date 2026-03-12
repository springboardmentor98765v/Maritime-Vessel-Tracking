from django.db import models


class Notification(models.Model):

    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    vessel = models.ForeignKey(
        'vessels.Vessel',
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    # ✅ Added from design diagram (event_id FK)
    event = models.ForeignKey(
        'vessels.VesselEvent',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )

    message = models.TextField()

    type = models.CharField(
        max_length=50,
        db_index=True
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Notification for {self.user.username} — {self.type}"
