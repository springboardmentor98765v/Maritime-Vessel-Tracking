import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getVessels } from "../api/axios";
import { useNavigate } from "react-router-dom";
//import greenMarker from "../assets/marker-green.png";
//import redMarker from "../assets/marker-red.png";
import accidentIconImg from "../assets/accident-icon.svg";
//import Notification from "./Notification";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { getAlerts } from "../api/axios";
import { useMap } from "react-leaflet";
import { getRiskZones } from "../api/axios";



function MapController({ vessel }) {
  const map = useMap();
  

  useEffect(() => {
    if (vessel) {
      map.setView(
        [vessel.last_position_lat, vessel.last_position_lon],
        7
      );
    }
  }, [vessel]);

  return null;
}



/* FIX leaflet icon */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
const accidentIcon = new L.Icon({
  iconUrl: accidentIconImg,
  iconSize: [20, 33],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30]
});
const alertIcon = new L.Icon({
  iconUrl: accidentIconImg,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -20]
});

export default function MapView() {
 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [zones, setZones] = useState([]);
  const [showStorm, setShowStorm] = useState(true);
  const [showPiracy, setShowPiracy] = useState(true);
  const [showAccident, setShowAccident] = useState(true);

  const stormZones = [
    {
      id: 1,
      center: [18.5, 72.8],
      radius: 200000,
      severity: "High"
    }
  ];

  const piracyZones = [
    {
      id: 1,
      coordinates: [
        [12, 45],
        [14, 48],
        [11, 50],
        [10, 46]
      ],
      risk: "Medium"
    }
  ];

  const accidentZones = [
    {
      id: 1,
      position: [20.1, 70.5],
      message: "Ship Collision Reported"
    }
  ];


  const [vessels, setVessels] = useState([]);
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
  console.log("Selected Vessel 👉", selectedVessel);
}, [selectedVessel]);
  const validAlerts = useMemo(() =>
  alerts.filter(a =>
    !isNaN(a.latitude) &&
    !isNaN(a.longitude)
  ),
[alerts]);

  /* ✅ DUMMY DATA (mentor demo ready) */

  const navigate = useNavigate();

  /* FETCH (backend later) */
  const fetchVessels = async () => {
    try {
      const res = await getVessels();

      const data =
        res?.data && res.data.length > 0
          ? res.data
          : dummyVessels;

      /* normalize numbers */
      const normalized = data.map(v => ({
        ...v,
        last_position_lat: Number(v.last_position_lat),
        last_position_lon: Number(v.last_position_lon)
      }));

      setVessels(normalized);

    } catch (err) {
      console.log("Using dummy vessels");
      setVessels(dummyVessels);
    }
  };
const fetchAlerts = async () => {
  try {
    // 🚨 STOP if vessel not selected
    if (!selectedVessel) {
      console.log("No vessel selected → skipping alerts");
      return;
    }

    // ✅ SAFE IMO extraction
    const imo =
      selectedVessel?.imo_number || selectedVessel?.imo_no;

    if (!imo) {
      console.log("IMO missing → skipping API");
      return;
    }

    console.log("Calling Alerts API with IMO:", imo);

    const res = await getAlerts(imo);

    const normalized = res.data.map(a => ({
      ...a,
      latitude: Number(a.latitude),
      longitude: Number(a.longitude)
    }));

    setAlerts(normalized);

  } catch (err) {
    console.error("Failed to fetch alerts", err);
  }
};

const fetchZones = async () => {
  try {
    const res = await getRiskZones();
    console.log("ZONES API RESPONSE:", res.data);

    const normalized = res.data.map(z => ({
      ...z,
      latitude: Number(z.latitude),
      longitude: Number(z.longitude),
      radius: Number(z.radius)
    }));

    setZones(normalized);

  } catch (err) {
    console.error("Zones error", err);
  }
};

  /* polling */
  useEffect(() => {

  fetchVessels();
  fetchZones();

  if (selectedVessel) {
    fetchAlerts();
  }

  const interval = setInterval(() => {
    fetchVessels();
    fetchZones();

    if (selectedVessel) {
      fetchAlerts();
    }
  }, 80000);
  

  return () => clearInterval(interval);

}, [selectedVessel]); // ✅ IMPORTANT

  /* VALID MARKERS ONLY */
  const validVessels = useMemo(() =>
    vessels.filter(v =>
      !isNaN(v.last_position_lat) &&
      !isNaN(v.last_position_lon)
    ),
    [vessels]
  );

  const totalVessels = validVessels.length;

  const movingVessels = validVessels.filter(
    v => Number(v.speed) > 0
  ).length;

  const stoppedVessels = validVessels.filter(
    v => Number(v.speed) === 0
  ).length;
 const createShipIcon = (speed, heading = 0) => {

  const color = speed > 0 ? "green" : "red";

  return L.divIcon({
    className: "ship-icon",
    html: `
      <div style="
        transform: rotate(${heading}deg);
        font-size: 22px;
        color: ${color};
      ">
        ▲
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

};

const shipIcons = useMemo(() => {
  return validVessels.map(v => ({
    id: v.imo_no || v.imo_number,
    icon: createShipIcon(v.speed, v.heading || 0)
  }));
}, [validVessels]);
  return (
    <div className="map-box">

      {/* TOP MAP STATS */}
      <div className="map-stats">
        <span>🚢 Total: {totalVessels}</span>
        <span>🟢 Moving: {movingVessels}</span>
        <span>🔴 Stopped: {stoppedVessels}</span>
      </div>

      {/* OVERLAY PANEL FOR SEARCH AND CONTROLS */}
      <div className="map-overlay-panel">
        <div className="map-search">
          <input
            type="text"
            placeholder="🔍 Search vessel name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => {
              const vessel = vessels.find(v =>
                v.name?.toLowerCase().includes(searchTerm.toLowerCase())
              );
              if (vessel) {
                setSelectedVessel(vessel);
              }
            }}
          >
            Search
          </button>
        </div>

        <div className="map-controls">
          <label>
            <input
              type="checkbox"
              checked={showStorm}
              onChange={() => setShowStorm(!showStorm)}
            />
            Show Storm Zones
          </label>
          <label>
            <input
              type="checkbox"
              checked={showPiracy}
              onChange={() => setShowPiracy(!showPiracy)}
            />
            Show Piracy Zones
          </label>
          <label>
            <input
              type="checkbox"
              checked={showAccident}
              onChange={() => setShowAccident(!showAccident)}
            />
            Show Accident Areas
          </label>
        </div>
      </div>

      <MapContainer
        center={[20, 78]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
      >
        
        <MapController vessel={selectedVessel} />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* ✅ SHIP MARKERS */}
        {validVessels.map((v) => {
          const isSelected =
            selectedVessel &&
            (selectedVessel.imo_no === v.imo_no ||
            selectedVessel.imo_number === v.imo_number);

       
          return (
            <>
            <Marker
              key={v.imo_no || v.imo_number }
              position={[v.last_position_lat, v.last_position_lon]}
              icon={shipIcons.find(i => i.id === (v.imo_no || v.imo_number))?.icon}
              eventHandlers={{
                click: () => setSelectedVessel(v)
              }}
            >
              <Popup>
  <div>
    <h4>🚢 {v.name}</h4>
    <p><b>Type:</b> {v.vessel_type}</p>
    <p><b>Destination:</b> {v.destination}</p>
    <p><b>Speed:</b> {v.speed} knots</p>
    <p><b>Flag:</b> {v.flag}</p>
    <p><b>Lat:</b> {v.last_position_lat}</p>
    <p><b>Lng:</b> {v.last_position_lon}</p>

    <button
      style={{
        marginTop: "8px",
        padding: "6px 10px",
        background: "#2c92e6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
      }}
      onClick={() =>
        navigate("/admin/vessels", {
          state: { vesselId: v.imo_no || v.imo_number }
        })
      }
    >
      View Details
    </button>
  </div>
</Popup>
            </Marker>
            {isSelected && (
      <Circle
        center={[v.last_position_lat, v.last_position_lon]}
        radius={25000}
        pathOptions={{
          color: "#0066ff",
          weight: 3,
          fillOpacity: 0.1
        }}
      />
    )}
  </>
);

})}
{/* ✅ RISK ZONES FROM BACKEND */}
{zones.map((zone) => {
  const zoneType = (zone.zone_type || "").toLowerCase();

  // 🌪 STORM
  if (zoneType === "storm" && showStorm) {
    return (
      <Circle
        key={zone.id}
        center={[zone.latitude, zone.longitude]}
        radius={zone.radius * 1000}
        pathOptions={{ color: "#cc0c0c", fillOpacity: 0.25 }}
      >
        <Popup>⚠ Storm Zone<br/>Severity: {zone.severity}</Popup>
      </Circle>
    );
  }

  // 🏴‍☠ PIRACY
  if (zoneType === "piracy" && showPiracy) {
    return (
      <Circle
        key={zone.id}
        center={[zone.latitude, zone.longitude]}
        radius={zone.radius * 1000}
        pathOptions={{ color: "#f59e0b", fillOpacity: 0.32 }}
      >
        <Popup>⚠ Piracy Zone<br/>Severity: {zone.severity}</Popup>
      </Circle>
    );
  }
  // 🚨 ACCIDENT
if (zoneType === "accident" && showAccident) {
  return (
    <Marker
      key={zone.id}
      position={[zone.latitude, zone.longitude]}
      icon={accidentIcon}
    >
      <Popup>
        🚨 Accident Zone <br />
        Severity: {zone.severity}
      </Popup>
    </Marker>
  );
}

  return null;
})}



          {/* ALERT MARKERS FROM BACKEND */}
          {validAlerts.map(alert => (
            <Marker
              key={alert.id}
              position={[alert.latitude, alert.longitude]}
              icon={alertIcon}
            >
              
              <Popup>

                <div style={{ padding: "5px" }}>

                <h4 style={{ color: "red", marginBottom: "6px" }}>
                  ⚠ {alert.type?.toUpperCase()} ALERT
                </h4>

                {alert.vessel_name && (
                  <p><b>Vessel:</b> {alert.vessel_name}</p>
                )}
                

                <p><b>Risk:</b> {alert.risk}</p>

                <p><b>Severity:</b> {alert.severity}</p>

              </div>

            </Popup>
            

          </Marker>
        ))}
        

      </MapContainer>
    </div>
  );
}