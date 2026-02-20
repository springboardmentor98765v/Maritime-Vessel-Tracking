import os
from .base import BaseAPIClient

class MarineTrafficClient(BaseAPIClient):
    BASE_URL = "https://services.marinetraffic.com/api/"

    def __init__(self):
        api_key = os.getenv("MARINETRAFFIC_API_KEY")
        super().__init__(api_key=api_key)

    def get_vessel_positions(self, imo=None, mmsi=None):
        endpoint = "exportvessel/v:8"

        params = {
            "api_key": self.api_key,
            "imo": imo,
            "mmsi": mmsi,
            "protocol": "jsono"
        }

        return self.get(endpoint, params=params)
