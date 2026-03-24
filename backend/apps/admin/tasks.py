from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

@shared_task
def clean_old_logs():
    """Scheduled task to clean API logs older than 7 days."""
    try:
        from apps.admin.models import ApiLog
        threshold = timezone.now() - timedelta(days=7)
        deleted, _ = ApiLog.objects.filter(timestamp__lt=threshold).delete()
        logger.info(f"Cleaned {deleted} old API logs.")
        return deleted
    except Exception as e:
        logger.error(f"Failed to clean old logs: {str(e)}")
