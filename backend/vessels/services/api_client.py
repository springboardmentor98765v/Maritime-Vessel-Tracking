import random
from datetime import datetime


def fetch_vessel_data():
    """
    Simulates fetching data from MarineTraffic / AIS API.
    Replace this with real API call later.
    """

    sample_vessels = [
        {
            "imo": "1234567",
            "name": "Ever Ocean",
            "mmsi": "987654321",
            "latitude": 12.9716 + random.uniform(-0.1, 0.1),
            "longitude": 77.5946 + random.uniform(-0.1, 0.1),
            "speed": random.uniform(0, 20),
            "course": random.uniform(0, 360),
            "destination": "Chennai",
        },
        {
            "imo": "7654321",
            "name": "Sea Voyager",
            "mmsi": "123456789",
            "latitude": 19.0760 + random.uniform(-0.1, 0.1),
            "longitude": 72.8777 + random.uniform(-0.1, 0.1),
            "speed": random.uniform(0, 15),
            "course": random.uniform(0, 360),
            "destination": "Mumbai",
        },
    ]

    return sample_vessels