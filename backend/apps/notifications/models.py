from django.db import models
#hello 

class Notification(models.Model):

    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True
    )

    vessel = models.ForeignKey(
        'vessels.Vessel',
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True,
        null=True,
        blank=True,
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

    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    is_read = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['vessel']),
            models.Index(fields=['user', 'is_read']),  # For fetching unread notifications per user
            models.Index(fields=['user', 'timestamp']),  # For chronological queries per user
            models.Index(fields=['is_read', 'timestamp']),  # For trending notifications
            models.Index(fields=['timestamp']),  # For global ordering
        ]

    def __str__(self):
        return f"Notification for {self.user.username} — {self.type}"

