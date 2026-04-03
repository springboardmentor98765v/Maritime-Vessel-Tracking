import logging
from integrations.unctad import fetch_unctad_port_data

logger = logging.getLogger(__name__)

def calculate_port_congestion_score(arrivals: int, departures: int) -> float:
    """
    congestion_score = (arrivals - departures) / arrivals
    """
    if arrivals == 0:
        return 0.0
    return round((arrivals - departures) / arrivals, 2)

from integrations.unctad import fetch_unctad_port_data
from .models import Port, PortTrafficHistory
from django.utils import timezone

def get_port_analytics():
    data = fetch_unctad_port_data()
    analytics = []

    for item in data:
        score = calculate_port_congestion_score(
            item['arrivals'],
            item['departures']
        )

        # ✅ Update or create Port
        port, _ = Port.objects.update_or_create(
            name=item['port_name'],
            defaults={
                "location": item['port_name'],
                "country": "Unknown",
                "congestion_score": score,
                "avg_wait_time": round(score * 10, 2),
                "arrivals": item['arrivals'],
                "departures": item['departures'],
            }
        )

        # ✅ Save history
        PortTrafficHistory.objects.create(
            port=port,
            arrivals=item['arrivals'],
            departures=item['departures'],
            congestion_score=score,
            timestamp=timezone.now()
        )

        analytics.append({
            "port": port.name,
            "arrivals": port.arrivals,
            "departures": port.departures,
            "congestion_score": port.congestion_score
        })

    return analytics