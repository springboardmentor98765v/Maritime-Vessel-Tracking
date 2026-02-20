import os
from .base import BaseAPIClient

class NOAAClient(BaseAPIClient):
    BASE_URL = "https://api.weather.gov/"

    def get_storm_alerts(self):
        endpoint = "alerts/active"
        return self.get(endpoint)
