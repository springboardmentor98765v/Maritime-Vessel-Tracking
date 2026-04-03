import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// This component accepts vessels as props
// Used inside MapPage or Dashboard wherever map is needed
function LiveTracking({ vessels = [] }) {
  const navigate = useNavigate();

  return (
    <MapContainer
      center={[20, 78]}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vessels.length === 0 && (
        // Default marker when no vessels loaded yet
        <Marker position={[13.0827, 80.2707]}>
          <Popup>Chennai Port</Popup>
        </Marker>
      )}

      {vessels.map((vessel) => (
        <Marker
          key={vessel.id}
          position={[vessel.last_position_lat, vessel.last_position_lon]}
        >
          <Popup>
            <div>
              <strong>{vessel.name}</strong><br />
              Type: {vessel.vessel_type}<br />
              Speed: {vessel.speed} knots<br />
              <button
                onClick={() => navigate(`/vessel/${vessel.id}`)}
                style={{
                  marginTop: "6px",
                  padding: "4px 10px",
                  background: "#1a73e8",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default LiveTracking;