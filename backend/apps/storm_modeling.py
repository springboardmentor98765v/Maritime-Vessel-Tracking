import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any

class StormForecastModel:
    """
    Simulates and forecasts storm paths based on historical data and current parameters.
    """
    @staticmethod
    def forecast_path(
        start_lat: float, 
        start_lon: float, 
        intensity: float, 
        heading: float, 
        speed: float, 
        hours: int = 48
    ) -> List[Dict[str, Any]]:
        """
        Generates a predicted path for a storm.
        """
        path = []
        current_lat = start_lat
        current_lon = start_lon
        
        # Simple simulation: storms tend to curve due to Coriolis effect
        # and follow pressure gradients.
        for h in range(1, hours + 1):
            # Add some randomness and curvature
            heading += np.random.normal(0, 2)  # Normal deviation
            
            # Simple conversion of heading/speed to lat/lon changes
            # (approximate: 1 degree lat = 111km)
            rad_heading = np.radians(heading)
            d_lat = (speed * np.cos(rad_heading)) / 111.0
            d_lon = (speed * np.sin(rad_heading)) / (111.0 * np.cos(np.radians(current_lat)))
            
            current_lat += d_lat
            current_lon += d_lon
            
            # Intensity might fluctuate
            intensity_change = np.random.normal(-0.5, 1)
            intensity = max(0, intensity + intensity_change)
            
            path.append({
                "hour": h,
                "timestamp": (datetime.now() + timedelta(hours=h)).isoformat(),
                "latitude": round(current_lat, 4),
                "longitude": round(current_lon, 4),
                "intensity": round(intensity, 2),
                "uncertainty_radius": round(h * 5.0, 2)  # Uncertainty grows over time
            })
            
        return path

    @staticmethod
    def calculate_vessel_risk(vessel_pos: Dict[str, float], storm_path: List[Dict[str, Any]]) -> str:
        """
        Calculates the risk level for a vessel based on proximity to the forecast path.
        """
        min_dist = float('inf')
        for point in storm_path:
            dist = np.sqrt((vessel_pos['lat'] - point['latitude'])**2 + 
                           (vessel_pos['lon'] - point['longitude'])**2)
            min_dist = min(min_dist, dist)
        
        if min_dist < 0.5: # Approx 50km
            return "EXTREME"
        elif min_dist < 1.5: # Approx 150km
            return "HIGH"
        elif min_dist < 3.0: # Approx 300km
            return "MODERATE"
        else:
            return "LOW"
