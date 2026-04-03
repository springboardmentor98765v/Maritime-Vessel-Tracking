import logging

logger = logging.getLogger(__name__)


def calculate_congestion_score(arrivals, departures):
    if arrivals == 0:
        return 0.0
    score = (arrivals - departures) / arrivals
    score = max(0.0, min(1.0, score))
    return round(score, 2)


def get_port_analytics(port):
    from django.utils import timezone

    arrivals = port.movements.filter(
        arrival_time__isnull=False
    ).count()

    departures = port.movements.filter(
        is_active=False,
        departure_time__isnull=False
    ).count()

    congestion_score = calculate_congestion_score(arrivals, departures)

    port.congestion_score = congestion_score
    port.last_analytics_update = timezone.now()
    port.save(update_fields=["congestion_score", "last_analytics_update"])

    try:
        from apps.ports.models import PortTrafficHistory
        PortTrafficHistory.objects.create(
            port=port,
            arrivals=arrivals,
            departures=departures,
            congestion_score=congestion_score,
        )
    except Exception as e:
        logger.error(f"Error saving traffic history: {e}")

    return {
        "port": port.name,
        "congestion_score": congestion_score,
        "arrivals": arrivals,
        "departures": departures,
    }


def get_all_ports_analytics():
    from apps.ports.models import Port
    ports = Port.objects.all()
    results = []
    for port in ports:
        data = get_port_analytics(port)
        results.append(data)
    return results
