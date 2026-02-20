import time
from integrations.marinetraffic import MarineTrafficClient
from integrations.aishub import AISHubClient
from integrations.noaa import NOAAClient
from integrations.unctad import UNCTADClient

def check_service(client_class):
    client = client_class()
    start = time.time()
    try:
        client.get("")
        duration = int((time.time() - start) * 1000)
        return True, duration, "OK"
    except Exception as e:
        return False, 0, str(e)
