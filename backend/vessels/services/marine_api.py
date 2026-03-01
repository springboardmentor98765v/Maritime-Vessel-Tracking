import requests

def fetch_live_vessels():
    """
    This function will later call real MarineTraffic or AIS API.
    For now, it returns structured mock data.
    """

    # Later replace this with real API request
    # response = requests.get("https://api.marinetraffic.com/...")
    # data = response.json()

    return [
        {
            "imo": "1234567",
            "name": "Ocean Titan",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "speed": 14.5,
            "vessel_type": "Cargo",
            "flag": "India",
        },
        {
            "imo": "7654321",
            "name": "Sea Explorer",
            "latitude": 13.0827,
            "longitude": 80.2707,
            "speed": 0,
            "vessel_type": "Tanker",
            "flag": "Singapore",
        },
    ]