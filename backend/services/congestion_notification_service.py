import logging

logger = logging.getLogger(__name__)


def send_congestion_notification(port_name, congestion_score):
    """
    PDF Step 5 — Send notification when port congestion is high
    """
    try:
        from django.contrib.auth import get_user_model
        from apps.notifications.models import Notification

        User = get_user_model()

        # ── Only send if congestion is high ──
        if congestion_score < 0.5:
            return

        message = (
            f"Congestion Alert: "
            f"Port {port_name} has high congestion. "
            f"Congestion score: {congestion_score}"
        )

        # ── Find all users and send notification ──
        users = User.objects.all()

        for user in users:
            Notification.objects.get_or_create(
                user=user,
                message=message,
                defaults={
                    "vessel": None,
                    "event_id": 0,
                    "is_read": False,
                }
            )
            logger.info(
                f"Congestion notification sent to "
                f"{user.username}: {message}"
            )

    except Exception as e:
        logger.error(f"Congestion notification error: {e}")