from datetime import datetime

def calculate_delay(departure_time, arrival_time):
    if not arrival_time:
        return None
    return (arrival_time - departure_time).total_seconds() / 3600
