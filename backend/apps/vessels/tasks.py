import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def sync_vessel_data(self):
    """
    Periodic Celery task: fetches live AIS positions and updates the database.
    Scheduled via CELERY_BEAT_SCHEDULE in settings.py.
    Retries up to 3 times (60 s apart) on transient failures.
    """
    try:
        from apps.vessels.services import fetch_and_update_vessels
        logger.info(f"[{timezone.now()}] sync_vessel_data: starting AIS sync...")
        fetch_and_update_vessels()
        logger.info(f"[{timezone.now()}] sync_vessel_data: AIS sync complete.")
    except Exception as exc:
        logger.error(f"sync_vessel_data failed: {exc}")
        raise self.retry(exc=exc)
