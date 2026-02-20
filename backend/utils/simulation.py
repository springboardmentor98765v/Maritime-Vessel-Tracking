import time
import random
from apps.vessels.tasks import process_ais_stream, update_global_density_map
from apps.safety.storm_modeling import StormForecastModel

def simulate_maritime_traffic():
    """
    Simulates a stream of AIS messages and updates analytics.
    """
    print("Starting maritime traffic simulation...")
    
    # Example NMEA payloads (simplified for simulation purpose)
    # Real NMEA looks like: !AIVDM,1,1,,A,13HOI:0P00Or6WPNoi9e6n9N059p,0*08
    mock_payloads = [
        "!AIVDM,1,1,,A,13HOI:0P00Or6WPNoi9e6n9N059p,0*08",
        "!AIVDM,1,1,,A,15Mg7P?P00D>tNb@>n7W?6nCP000,0*11",
    ]
    
    print(f"Feeding {len(mock_payloads)} AIS messages to parser...")
    process_ais_stream(mock_payloads)
    
    print("Updating global density map...")
    result = update_global_density_map()
    print(result)
    
    print("Simulating storm forecast...")
    storm_path = StormForecastModel.forecast_path(
        start_lat=25.0,
        start_lon=-80.0,
        intensity=950, # hPa
        heading=290,
        speed=15,
        hours=24
    )
    print(f"Generated storm path with {len(storm_path)} points.")
    
    # Check risk for a vessel
    vessel_pos = {"lat": 26.5, "lon": -82.0}
    risk = StormForecastModel.calculate_vessel_risk(vessel_pos, storm_path)
    print(f"Risk for vessel at {vessel_pos}: {risk}")

if __name__ == "__main__":
    simulate_maritime_traffic()
