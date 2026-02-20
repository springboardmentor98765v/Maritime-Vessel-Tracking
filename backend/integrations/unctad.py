from .base import BaseAPIClient

class UNCTADClient(BaseAPIClient):
    BASE_URL = "https://unctadstat-api.unctad.org/api/"

    def get_port_statistics(self, port_code):
        endpoint = f"maritime/ports/{port_code}"
        return self.get(endpoint)
