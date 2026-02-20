from pyais import decode
from typing import Dict, Any, Optional

class AISParser:
    @staticmethod
    def parse_message(payload: str) -> Optional[Dict[str, Any]]:
        """
        Parses an AIS NMEA message and returns a dictionary of vessel data.
        """
        try:
            # Decode the message
            decoded = decode(payload)
            
            # Extract common fields
            data = {
                "mmsi": decoded.mmsi,
                "msg_type": decoded.msg_type,
            }

            # Type-specific extraction
            if hasattr(decoded, "lat") and hasattr(decoded, "lon"):
                data["latitude"] = float(decoded.lat)
                data["longitude"] = float(decoded.lon)
            
            if hasattr(decoded, "speed"):
                data["speed"] = float(decoded.speed)
                
            if hasattr(decoded, "course"):
                data["course"] = float(decoded.course)
                
            if hasattr(decoded, "shipname"):
                data["name"] = decoded.shipname.strip()
                
            if hasattr(decoded, "shiptype"):
                data["vessel_type"] = decoded.shiptype
                
            return data
        except Exception as e:
            print(f"Error parsing AIS message: {e}")
            return None

    @staticmethod
    def identify_vessel_type(type_code: int) -> str:
        """
        Maps AIS ship type codes to human-readable types.
        """
        if 70 <= type_code <= 79:
            return "CARGO"
        elif 80 <= type_code <= 89:
            return "TANKER"
        elif 60 <= type_code <= 69:
            return "PASSENGER"
        elif 40 <= type_code <= 49:
            return "CONTAINER"
        else:
            return "OTHER"
