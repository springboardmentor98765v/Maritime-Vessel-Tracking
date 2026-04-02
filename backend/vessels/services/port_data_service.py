def fetch_port_data():
    """
    Temporary demo data for port congestion analytics.
    Later this can be replaced with real API data.
    """

    ports = [
        {
            "port_name": "Singapore",
            "arrivals": 120,
            "departures": 115,
            "capacity": 60,
        },
        {
            "port_name": "Dubai",
            "arrivals": 95,
            "departures": 88,
            "capacity": 50,
        },
        {
            "port_name": "Rotterdam",
            "arrivals": 160,
            "departures": 140,
            "capacity": 90,
        },
    ]

    # Backward compatible alias used by existing congestion logic.
    for p in ports:
        p["vessels_in_port"] = p["arrivals"] - p["departures"]

    return ports