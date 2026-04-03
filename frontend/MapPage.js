import "leaflet/dist/leaflet.css";
import React, { useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import useVessels from "../hooks/useVessels";

// ── Fix Leaflet default marker icon ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// ── Custom color icon based on vessel type ──
const shipIcon = (vesselType) => {
  let color;
  switch (vesselType.trim()) {
    case "Container":    color = "#1e88e5"; break;
    case "Tanker":       color = "#e53935"; break;
    case "Cargo":        color = "#43a047"; break;
    case "Bulk Carrier": color = "#fb8c00"; break;
    default:             color = "#9e9e9e";
  }
  return L.divIcon({
    html: `<div style="
      background:${color};
      width:14px;
      height:14px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 0 6px rgba(0,0,0,0.5);
    "></div>`,
    className: "",
    iconSize: [14, 14],
  });
};

// ── STEP 3 — Warning Icon for Accident zones ──
const warningIcon = L.divIcon({
  html: `<div style="
    background:#ff9800;
    width:28px;
    height:28px;
    border-radius:50%;
    border:3px solid white;
    box-shadow:0 0 8px rgba(0,0,0,0.5);
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:16px;
    line-height:1;
  ">⚠️</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// ── STEP 3 — Safety Zones Data ──
// Replace with GET /api/safety/zones when backend ready
const SAFETY_ZONES = [
  {
    id: 1,
    type: "Storm",
    shape: "circle",
    lat: 19.5,
    lon: 71.0,
    radius: 150000,
    severity: "High",
    message: "Severe cyclone warning active near Mumbai coast",
    color: "#e53935",
  },
  {
    id: 2,
    type: "Piracy",
    shape: "polygon",
    positions: [
      [13.5, 77.5],
      [13.5, 79.5],
      [11.0, 79.5],
      [11.0, 77.5],
    ],
    severity: "Medium",
    message: "Piracy activity reported in this zone",
    color: "#fdd835",
  },
  {
    id: 3,
    type: "Accident",
    shape: "icon",
    lat: 22.0,
    lon: 87.0,
    severity: "Low",
    message: "Minor collision reported near Kolkata",
    color: "#ff9800",
  },
];

// ── STEP 5 — Risk Alerts Data ──
// Replace with GET /api/safety/alerts when backend ready
const RISK_ALERTS = [
  {
    id: 1,
    type: "Storm",
    vessel: "MSC LUNA",
    message: "Vessel MSC LUNA entering severe weather zone",
    severity: "High",
    time: new Date().toISOString(),
  },
  {
    id: 2,
    type: "Piracy",
    vessel: "OCEAN KING",
    message: "OCEAN KING approaching piracy zone near Chennai",
    severity: "Medium",
    time: new Date().toISOString(),
  },
];

// ── Loading Spinner Component ──
const Spinner = () => (
  <>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
    <div style={{
      width: "40px",
      height: "40px",
      border: "4px solid #2e3d4f",
      borderTop: "4px solid #42a5f5",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: "16px",
    }} />
  </>
);

// ── Toast Component ──
const Toast = ({ message, type, onClose }) => (
  <>
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      background: type === "error" ? "#b71c1c" : "#2e7d32",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: "8px",
      zIndex: 9999,
      fontSize: "14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      animation: "fadeIn 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      maxWidth: "320px",
    }}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          fontSize: "16px",
          padding: "0",
        }}
      >
        ✕
      </button>
    </div>
  </>
);

// ────────────────────────────────────────────────────
// ── STEP 5 — VesselMarker with Risk Alert in Popup ──
// ────────────────────────────────────────────────────
const VesselMarker = React.memo(({ vessel, onViewDetails }) => {
  const icon = useMemo(
    () => shipIcon(vessel.vessel_type),
    [vessel.vessel_type]
  );

  // ── Check if this vessel has a risk alert ──
  const vesselAlert = RISK_ALERTS.find(
    (a) => a.vessel === vessel.name
  );

  return (
    <Marker
      position={[vessel.last_position_lat, vessel.last_position_lon]}
      icon={icon}
    >
      <Popup>
        <div style={{ minWidth: "180px" }}>

          {/* ── Vessel Name ── */}
          <strong style={{
            fontSize: "14px",
            display: "block",
            marginBottom: "6px",
          }}>
            {vessel.name}
          </strong>

          {/* ── Vessel Info ── */}
          <div style={{
            fontSize: "12px",
            lineHeight: "1.8",
            color: "#333",
          }}>
            <div>Type: {vessel.vessel_type}</div>
            <div>Flag: {vessel.flag}</div>
            <div>Speed: {vessel.speed} knots</div>
            <div>Destination: {vessel.destination || "Unknown"}</div>
          </div>

          {/* ── STEP 5 — Risk Alert inside Popup ──
              Only shows if this vessel has an alert
              Replace RISK_ALERTS with API data when
              backend ready: GET /api/safety/alerts
          ── */}
          {vesselAlert && (
            <div style={{
              marginTop: "10px",
              padding: "8px 10px",
              background:
                vesselAlert.severity === "High"   ? "#b71c1c" :
                vesselAlert.severity === "Medium" ? "#e65100" : "#f57f17",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "11px",
              lineHeight: "1.8",
            }}>
              {/* ── Alert title ── */}
              <div style={{
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "2px",
              }}>
                ⚠ {vesselAlert.type} Warning
              </div>

              {/* ── Vessel name ── */}
              <div>Vessel: {vesselAlert.vessel}</div>

              {/* ── Risk message ── */}
              <div>Risk: {vesselAlert.message}</div>

              {/* ── Severity ── */}
              <div style={{ fontWeight: "bold", marginTop: "2px" }}>
                Severity: {vesselAlert.severity}
              </div>
            </div>
          )}

          {/* ── View Details Button ── */}
          <button
            onClick={() => onViewDetails(vessel.id)}
            style={{
              marginTop: "10px",
              padding: "5px 12px",
              background: "#1a73e8",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              fontSize: "12px",
            }}
          >
            View Details →
          </button>
        </div>
      </Popup>
    </Marker>
  );
});

function MapPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    vessel_type: "",
    flag: "",
    cargo_type: "",
    destination: "",
  });

  const [toast, setToast] = useState(null);

  // ── STEP 4 — Overlay Toggle State ──
  const [showStorm,    setShowStorm]    = useState(true);
  const [showPiracy,   setShowPiracy]   = useState(true);
  const [showAccident, setShowAccident] = useState(true);

  // ── STEP 5 — Alert Panel Toggle ──
  const [showAlerts, setShowAlerts] = useState(true);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const { vessels, loading, error, refetch } = useVessels(filters);

  React.useEffect(() => {
    if (error) showToast(`⚠ ${error}`, "error");
  }, [error]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      vessel_type: "",
      flag: "",
      cargo_type: "",
      destination: "",
    });
  };

  const handleViewDetails = useCallback(
    (id) => navigate(`/vessel/${id}`),
    [navigate]
  );

  const filteredVessels = useMemo(() => {
    let result = [...vessels];
    if (filters.vessel_type) {
      result = result.filter(
        (v) => v.vessel_type.trim().toLowerCase() ===
               filters.vessel_type.trim().toLowerCase()
      );
    }
    if (filters.flag) {
      result = result.filter((v) =>
        v.flag.trim().toLowerCase().includes(
          filters.flag.trim().toLowerCase()
        )
      );
    }
    if (filters.cargo_type) {
      result = result.filter((v) =>
        v.cargo_type.trim().toLowerCase().includes(
          filters.cargo_type.trim().toLowerCase()
        )
      );
    }
    if (filters.destination) {
      result = result.filter((v) =>
        v.destination.trim().toLowerCase().includes(
          filters.destination.trim().toLowerCase()
        )
      );
    }
    console.log("✅ useMemo filtered vessels:", result.length);
    return result;
  }, [vessels, filters]);

  const vesselMarkers = useMemo(() =>
    filteredVessels.map((vessel) => (
      <VesselMarker
        key={vessel.id}
        vessel={vessel}
        onViewDetails={handleViewDetails}
      />
    )),
    [filteredVessels, handleViewDetails]
  );

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== ""),
    [filters]
  );

  return (
    <div
      className="page-fade"
      style={{
        display: "flex",
        height: "calc(100vh - 60px)",
        background: "#0d1b2a",
        scrollBehavior: "smooth",
        overflowY: "auto",
      }}
    >

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── STEP 5 — Risk Alert Panel bottom right ── */}
      {showAlerts && RISK_ALERTS.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9998,
          display: "flex",
          flexDirection: "column",
          maxWidth: "320px",
          width: "100%",
        }}>
          {/* ── Alert Panel Header ── */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#b71c1c",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "8px 8px 0 0",
            fontSize: "13px",
            fontWeight: "bold",
          }}>
            <span>⚠️ Risk Alerts ({RISK_ALERTS.length})</span>
            <button
              onClick={() => setShowAlerts(false)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          </div>

          {/* ── Alert Items ── */}
          {RISK_ALERTS.map((alert, index) => (
            <div
              key={alert.id}
              style={{
                background: "#1e2a3a",
                borderLeft: `4px solid ${
                  alert.severity === "High"   ? "#e53935" :
                  alert.severity === "Medium" ? "#fb8c00" : "#fdd835"
                }`,
                padding: "10px 14px",
                borderRadius: index === RISK_ALERTS.length - 1
                  ? "0 0 8px 8px" : "0",
                borderBottom: index !== RISK_ALERTS.length - 1
                  ? "1px solid #2e3d4f" : "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px",
              }}>
                <strong style={{
                  fontSize: "13px",
                  color: alert.severity === "High"   ? "#e53935" :
                         alert.severity === "Medium" ? "#fb8c00" : "#fdd835",
                }}>
                  ⚠ {alert.type} Warning
                </strong>
                <span style={{
                  fontSize: "11px",
                  background:
                    alert.severity === "High"   ? "#b71c1c" :
                    alert.severity === "Medium" ? "#e65100" : "#f57f17",
                  color: "#fff",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}>
                  {alert.severity}
                </span>
              </div>
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#ccc" }}>
                🚢 {alert.vessel}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#aaa" }}>
                {alert.message}
              </p>
              <small style={{ color: "#90caf9", fontSize: "11px" }}>
                {new Date(alert.time).toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>
      )}

      {/* ── Show Alerts Button when dismissed ── */}
      {!showAlerts && RISK_ALERTS.length > 0 && (
        <button
          onClick={() => setShowAlerts(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9998,
            background: "#b71c1c",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          ⚠️ Show Risk Alerts ({RISK_ALERTS.length})
        </button>
      )}

      {/* ── Filter Sidebar ── */}
      <div
        className="filter-sidebar slide-in"
        style={{
          width: "220px",
          background: "#1e2a3a",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          overflowY: "auto",
          scrollBehavior: "smooth",
        }}
      >
        <h3 style={{ marginBottom: "8px" }}>🔍 Filter Vessels</h3>

        <label style={labelStyle}>Vessel Type</label>
        <select
          name="vessel_type"
          value={filters.vessel_type}
          onChange={handleFilterChange}
          style={inputStyle}
        >
          <option value="">All</option>
          <option value="Container">Container</option>
          <option value="Tanker">Tanker</option>
          <option value="Cargo">Cargo</option>
          <option value="Bulk Carrier">Bulk Carrier</option>
        </select>

        <label style={labelStyle}>Flag</label>
        <input
          name="flag"
          placeholder="e.g. India"
          value={filters.flag}
          onChange={handleFilterChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Cargo Type</label>
        <input
          name="cargo_type"
          placeholder="e.g. Oil"
          value={filters.cargo_type}
          onChange={handleFilterChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Destination</label>
        <input
          name="destination"
          placeholder="e.g. Mumbai"
          value={filters.destination}
          onChange={handleFilterChange}
          style={inputStyle}
        />

        <button
          onClick={handleReset}
          className="btn-full"
          style={resetBtnStyle}
        >
          Reset Filters
        </button>

        {/* ── Color Legend ── */}
        <div style={{ marginTop: "12px" }}>
          <p style={{
            color: "#90caf9",
            fontSize: "12px",
            marginBottom: "8px",
          }}>
            📍 Vessel Types
          </p>
          {[
            { type: "Container",    color: "#1e88e5" },
            { type: "Tanker",       color: "#e53935" },
            { type: "Cargo",        color: "#43a047" },
            { type: "Bulk Carrier", color: "#fb8c00" },
          ].map((item) => (
            <div key={item.type} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}>
              <div style={{
                width: "12px", height: "12px",
                borderRadius: "50%",
                background: item.color,
                border: "2px solid white",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: "12px", color: "#ccc" }}>
                {item.type}
              </span>
            </div>
          ))}
        </div>

        {/* ── STEP 4 — Safety Overlay Toggle Controls ── */}
        <div style={{
          marginTop: "8px",
          borderTop: "1px solid #2e3d4f",
          paddingTop: "16px",
        }}>
          <p style={{
            color: "#90caf9",
            fontSize: "12px",
            marginBottom: "10px",
            fontWeight: "bold",
          }}>
            🛡️ Safety Overlays
          </p>

          {/* ── ☑ Show Storm Zones ── */}
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
            cursor: "pointer",
            fontSize: "13px",
            color: "#ccc",
          }}>
            <input
              type="checkbox"
              checked={showStorm}
              onChange={() => setShowStorm(!showStorm)}
              style={{ cursor: "pointer", accentColor: "#e53935" }}
            />
            <span style={{
              width: "10px", height: "10px",
              borderRadius: "50%",
              background: "#e53935",
              display: "inline-block",
              flexShrink: 0,
            }} />
            Show Storm Zones
          </label>

          {/* ── ☑ Show Piracy Zones ── */}
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
            cursor: "pointer",
            fontSize: "13px",
            color: "#ccc",
          }}>
            <input
              type="checkbox"
              checked={showPiracy}
              onChange={() => setShowPiracy(!showPiracy)}
              style={{ cursor: "pointer", accentColor: "#fdd835" }}
            />
            <span style={{
              width: "10px", height: "10px",
              borderRadius: "2px",
              background: "#fdd835",
              display: "inline-block",
              flexShrink: 0,
            }} />
            Show Piracy Zones
          </label>

          {/* ── ☑ Show Accident Areas ── */}
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
            cursor: "pointer",
            fontSize: "13px",
            color: "#ccc",
          }}>
            <input
              type="checkbox"
              checked={showAccident}
              onChange={() => setShowAccident(!showAccident)}
              style={{ cursor: "pointer", accentColor: "#ff9800" }}
            />
            <span style={{ fontSize: "14px" }}>⚠️</span>
            Show Accident Areas
          </label>
        </div>

        {/* ── Vessel Count ── */}
        <div style={{ marginTop: "auto", color: "#90caf9", fontSize: "13px" }}>
          {loading
            ? "Loading..."
            : `${filteredVessels.length} vessels found`}
        </div>
      </div>

      {/* ── Map Area ── */}
      <div
        className="map-container"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {/* ── Top Bar ── */}
        <div style={{
          background: "#1e2a3a",
          color: "#fff",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #2e3d4f",
        }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>
            🌍 Live Vessel Tracking
          </h2>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "2px",
          }}>
            <span style={{
              fontSize: "12px",
              color: loading ? "#42a5f5" : "#66bb6a",
            }}>
              {loading ? "⟳ Refreshing..." : "✅ Live — Auto-refreshes every 30s"}
            </span>
            <span style={{ fontSize: "11px", color: "#aaa" }}>
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* ── Map Content ── */}
        <div style={{ flex: 1, position: "relative" }}>

          {/* ── Loading Spinner ── */}
          {loading && filteredVessels.length === 0 && (
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#0d1b2a",
              zIndex: 999,
            }}>
              <Spinner />
              <p style={{ color: "#fff", fontSize: "16px" }}>
                Loading vessels...
              </p>
            </div>
          )}

          {/* ── API Error with Retry ── */}
          {!loading && error && (
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#0d1b2a",
              zIndex: 999,
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
              <p style={{
                color: "#fff",
                fontSize: "16px",
                marginBottom: "20px",
              }}>
                Failed to load vessel data.
              </p>
              <button
                onClick={refetch}
                className="btn-full"
                style={{
                  padding: "10px 24px",
                  background: "#1e88e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                🔄 Retry
              </button>
            </div>
          )}

          {/* ── No Search Results ── */}
          {!loading && !error && filteredVessels.length === 0 && hasActiveFilters && (
            <div
              className="page-fade"
              style={{
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#1e2a3a",
                color: "#fff",
                padding: "16px 24px",
                borderRadius: "10px",
                zIndex: 999,
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
              <p style={{ margin: "0 0 12px", fontSize: "15px" }}>
                No vessels match your filters.
              </p>
              <button
                onClick={handleReset}
                className="btn-full"
                style={{
                  padding: "8px 16px",
                  background: "#e53935",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* ── Map with Markers + Safety Overlays ── */}
          {!error && (
            <MapContainer
              center={[20, 78]}
              zoom={4}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* ── Vessel Markers with Clustering ── */}
              <MarkerClusterGroup
                chunkedLoading={true}
                maxClusterRadius={60}
              >
                {vesselMarkers}
              </MarkerClusterGroup>

              {/* ────────────────────────────────────────
                  STEP 3 — Safety Zone Overlays
                  STEP 4 — Controlled by checkboxes
                  ──────────────────────────────────────── */}
              {SAFETY_ZONES.map((zone) => {

                // ── STEP 4 — Hide if checkbox unchecked ──
                if (zone.type === "Storm"    && !showStorm)    return null;
                if (zone.type === "Piracy"   && !showPiracy)   return null;
                if (zone.type === "Accident" && !showAccident) return null;

                // ── Red Circle → Storm areas ──
                if (zone.shape === "circle") {
                  return (
                    <Circle
                      key={zone.id}
                      center={[zone.lat, zone.lon]}
                      radius={zone.radius}
                      pathOptions={{
                        color:       zone.color,
                        fillColor:   zone.color,
                        fillOpacity: 0.15,
                        weight:      2,
                      }}
                    >
                      <Popup>
                        <div style={{ minWidth: "180px" }}>
                          <strong style={{
                            fontSize: "14px",
                            color: zone.color,
                            display: "block",
                            marginBottom: "6px",
                          }}>
                            ⚠ Storm Zone
                          </strong>
                          <div style={{
                            fontSize: "12px",
                            lineHeight: "1.8",
                          }}>
                            <div>
                              <strong>Severity:</strong>{" "}
                              <span style={{ color: zone.color }}>
                                {zone.severity}
                              </span>
                            </div>
                            <div>
                              <strong>Radius:</strong>{" "}
                              {(zone.radius / 1000).toFixed(0)} km
                            </div>
                            <div style={{
                              marginTop: "4px",
                              color: "#555",
                            }}>
                              {zone.message}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Circle>
                  );
                }

                // ── Yellow Polygon → Piracy zones ──
                if (zone.shape === "polygon") {
                  return (
                    <Polygon
                      key={zone.id}
                      positions={zone.positions}
                      pathOptions={{
                        color:       zone.color,
                        fillColor:   zone.color,
                        fillOpacity: 0.15,
                        weight:      2,
                        dashArray:   "6,4",
                      }}
                    >
                      <Popup>
                        <div style={{ minWidth: "180px" }}>
                          <strong style={{
                            fontSize: "14px",
                            color: zone.color,
                            display: "block",
                            marginBottom: "6px",
                          }}>
                            ⚠ Piracy Zone
                          </strong>
                          <div style={{
                            fontSize: "12px",
                            lineHeight: "1.8",
                          }}>
                            <div>
                              <strong>Severity:</strong>{" "}
                              <span style={{ color: zone.color }}>
                                {zone.severity}
                              </span>
                            </div>
                            <div style={{
                              marginTop: "4px",
                              color: "#555",
                            }}>
                              {zone.message}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Polygon>
                  );
                }

                // ── Warning Icon → Accident zones ──
                if (zone.shape === "icon") {
                  return (
                    <Marker
                      key={zone.id}
                      position={[zone.lat, zone.lon]}
                      icon={warningIcon}
                    >
                      <Popup>
                        <div style={{ minWidth: "180px" }}>
                          <strong style={{
                            fontSize: "14px",
                            color: zone.color,
                            display: "block",
                            marginBottom: "6px",
                          }}>
                            ⚠️ Accident Zone
                          </strong>
                          <div style={{
                            fontSize: "12px",
                            lineHeight: "1.8",
                          }}>
                            <div>
                              <strong>Severity:</strong>{" "}
                              <span style={{ color: zone.color }}>
                                {zone.severity}
                              </span>
                            </div>
                            <div style={{
                              marginTop: "4px",
                              color: "#555",
                            }}>
                              {zone.message}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }

                return null;
              })}

            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ──
const labelStyle = {
  fontSize: "12px",
  color: "#90caf9",
  marginBottom: "2px",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #2e3d4f",
  background: "#0d1b2a",
  color: "#fff",
  fontSize: "13px",
};

const resetBtnStyle = {
  width: "100%",
  padding: "8px",
  background: "#e53935",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  marginTop: "4px",
};

export default MapPage;
