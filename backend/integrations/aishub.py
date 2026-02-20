import os
from .base import BaseAPIClient

class AISHubClient(BaseAPIClient):
    BASE_URL = "https://data.aishub.net/ws.php"

    def __init__(self):
        api_key = os.getenv("AISHUB_API_KEY")
        super().__init__(api_key=api_key)

    def get_positions(self):
        params = {
            "username": self.api_key,
            "format": "json"
        }

        return self.get("", params=params)
