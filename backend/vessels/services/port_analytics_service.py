from .port_data_service import fetch_port_data


def get_port_congestion():

    ports = fetch_port_data()

    result = []

    for port in ports:
        arrivals = float(port.get("arrivals", 0))
        departures = float(port.get("departures", 0))
        capacity = float(port.get("capacity", 1)) or 1.0

        congestion_index = (arrivals - departures) / max(capacity, 1.0)
        congestion_score_0_100 = max(0.0, min(1.0, congestion_index + 0.5)) * 100

        result.append(
            {
                "port": port["port_name"],
                "arrivals": arrivals,
                "departures": departures,
                "vessels": port.get("vessels_in_port", arrivals),
                "capacity": port["capacity"],
                "congestion_index": round(congestion_index, 4),
                "congestion_score": round(congestion_score_0_100, 2),
            }
        )

    return result