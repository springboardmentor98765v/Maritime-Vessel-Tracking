import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getVoyageHistory } from "../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl:       require("leaflet/dist/images/marker-icon.png"),
  shadowUrl:     require("leaflet/dist/images/marker-shadow.png"),
});

const vesselIcon = L.divIcon({
  html: `<div style="
    background: #1e88e5;
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 8px rgba(30,136,229,0.8);
  "></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const eventIcon = (type) => {
  const color =
    type === "storm"    ? "#e53935" :
    type === "piracy"   ? "#fb8c00" :
    type === "arrived"  ? "#43a047" :
    type === "departed" ? "#1e88e5" : "#9e9e9e";
  return L.divIcon({
    html: `<div style="
      background: ${color}; width: 12px; height: 12px;
      border-radius: 50%; border: 2px solid white;
      box-shadow: 0 0 6px rgba(0,0,0,0.5);
    "></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const generateMockTimeline = (vesselId) => {
  const name = vesselId === "1" ? "MSC LUNA" : vesselId === "2" ? "OCEAN KING" : `Vessel ${vesselId}`;
  const base = { lat: 19.076, lon: 72.877 };
  const now = Date.now();
  
  return [
    { type: "event",    event: "departed", lat: base.lat,       lon: base.lon,       title: "Port Departure", time: new Date(now - 5 * 3600000).toISOString(), vessel: name, port: "Mumbai Port" },
    { type: "position",                    lat: base.lat + 0.1, lon: base.lon + 0.1, speed: 14.5,             time: new Date(now - 4 * 3600000).toISOString(), vessel: name },
    { type: "event",    event: "storm",    lat: base.lat + 0.2, lon: base.lon + 0.15, title: "Storm Warning", time: new Date(now - 3 * 3600000).toISOString(), vessel: name },
    { type: "position",                    lat: base.lat + 0.3, lon: base.lon + 0.25, speed: 12.0,            time: new Date(now - 2 * 3600000).toISOString(), vessel: name },
    { type: "position",                    lat: base.lat + 0.4, lon: base.lon + 0.35, speed: 15.2,            time: new Date(now - 1 * 3600000).toISOString(), vessel: name },
    { type: "event",    event: "arrived",  lat: base.lat + 0.5, lon: base.lon + 0.45, title: "Port Arrival",  time: new Date(now).toISOString(), vessel: name, port: "Surat Port" }
  ];
};

const VoyageReplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [timeline, setTimeline]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [speed, setSpeed]               = useState(1000);
  const [vesselName, setVesselName]     = useState("");
  const [usingMock, setUsingMock]       = useState(false);

  const intervalRef = useRef(null);
  const mapRef      = useRef(null);

  // ── Helper: safely extract a string error message ──
  const extractErrorMessage = (err) => {
    // Prioritise our custom message (set by the interceptor)
    if (typeof err.message === "string") return err.message;
    // DRF response body
    const data = err.response?.data;
    if (!data) return "Could not load voyage history. Check backend connection.";
    if (typeof data === "string") return data;
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.error  === "string") return data.error;
    return "Could not load voyage history. Check backend connection.";
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVoyageHistory(id);
        if (!Array.isArray(data) || data.length === 0) {
          // Empty — fall back to mock
          throw new Error("No voyage data returned from backend");
        }
        setTimeline(data);
        if (data[0]?.vessel) setVesselName(data[0].vessel);
        setUsingMock(false);
      } catch (err) {
        // Fall back to mock timeline so the replay always works
        const mock = generateMockTimeline(id);
        setTimeline(mock);
        if (mock[0]?.vessel) setVesselName(mock[0].vessel);
        setUsingMock(true);
        // Only show an error overlay if even mock fails (shouldn't happen)
        console.warn("VoyageReplay fallback to mock:", extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  const positions = timeline.filter((item) => item.type === "position" && item.lat && item.lon);
  const events    = timeline.filter((item) => item.type === "event");
  const currentItem = timeline[currentIndex];

  const currentPosition = (() => {
    for (let i = currentIndex; i >= 0; i--) {
      if (timeline[i]?.type === "position" && timeline[i]?.lat && timeline[i]?.lon)
        return [timeline[i].lat, timeline[i].lon];
    }
    return null;
  })();

  const pathSoFar = timeline
    .slice(0, currentIndex + 1)
    .filter((item) => item.type === "position" && item.lat && item.lon)
    .map((item) => [item.lat, item.lon]);

  const play = useCallback(() => {
    if (currentIndex >= timeline.length - 1) setCurrentIndex(0);
    setIsPlaying(true);
  }, [currentIndex, timeline.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= timeline.length - 1) {
            setIsPlaying(false);
            clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, timeline.length]);

  const reset = () => { pause(); setCurrentIndex(0); };

  const formatTime = (timeStr) => {
    if (!timeStr) return "Unknown";
    try { return new Date(timeStr).toLocaleString(); } catch { return timeStr; }
  };

  const getEventColor = (type) => {
    if (!type) return "#aaa";
    if (type.includes("storm"))   return "#e53935";
    if (type.includes("piracy"))  return "#fb8c00";
    if (type.includes("arrived")) return "#43a047";
    if (type.includes("depart"))  return "#1e88e5";
    return "#9e9e9e";
  };

  if (loading) {
    return (
      <div style={{ background: "#0d1b2a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", gap: "12px" }}>
        <div style={{ width: "24px", height: "24px", border: "3px solid #42a5f5", borderTop: "3px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Loading voyage history…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#0d1b2a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: "16px" }}>
        <div style={{ fontSize: "48px" }}>⚠️</div>
        <p style={{ fontSize: "16px" }}>{String(error)}</p>
        <button onClick={() => navigate(-1)} style={{ padding: "10px 20px", background: "#1e88e5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d1b2a", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      {/* ── Header ── */}
      <div style={{ background: "#1e2a3a", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2e3d4f", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "18px" }}>🎬 Replay Voyage</h2>
          <p style={{ margin: 0, color: "#90caf9", fontSize: "13px" }}>
            {vesselName || `Vessel ${id}`} — Step {currentIndex + 1} of {timeline.length}
            {usingMock && <span style={{ color: "#fb8c00", marginLeft: "8px" }}>(demo data)</span>}
          </p>
        </div>
        <button onClick={() => navigate(-1)} style={{ padding: "8px 16px", background: "#1e2a3a", color: "#fff", border: "1px solid #42a5f5", borderRadius: "6px", cursor: "pointer" }}>
          ← Back
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, height: "calc(100vh - 120px)" }}>
        {/* ── Map ── */}
        <div style={{ flex: 1, position: "relative" }}>
          {currentPosition && (
            <MapContainer center={currentPosition} zoom={5} style={{ height: "100%", width: "100%" }} ref={mapRef}>
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {positions.length > 1 && (
                <Polyline positions={positions.map((p) => [p.lat, p.lon])} pathOptions={{ color: "#555", weight: 2, dashArray: "5,5", opacity: 0.5 }} />
              )}
              {pathSoFar.length > 1 && (
                <Polyline positions={pathSoFar} pathOptions={{ color: "#1e88e5", weight: 3, opacity: 0.9 }} />
              )}
              {events.map((event, idx) =>
                event.lat && event.lon ? (
                  <Marker key={idx} position={[event.lat, event.lon]} icon={eventIcon(event.event)}>
                    <Popup>
                      <div style={{ minWidth: "160px" }}>
                        <strong style={{ color: getEventColor(event.event) }}>⚠ {event.event?.toUpperCase()}</strong><br />
                        <span>{event.title}</span><br />
                        <small>{formatTime(event.time)}</small>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
              {currentPosition && (
                <Marker position={currentPosition} icon={vesselIcon}>
                  <Popup>
                    <div>
                      <strong>🚢 {vesselName}</strong><br />
                      <span>{formatTime(currentItem?.time)}</span><br />
                      {currentItem?.speed && <span>Speed: {currentItem.speed.toFixed ? currentItem.speed.toFixed(1) : currentItem.speed} knots</span>}
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          )}
        </div>

        {/* ── Controls Panel ── */}
        <div style={{ width: "280px", background: "#1e2a3a", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", borderLeft: "1px solid #2e3d4f" }}>
          <div>
            <p style={{ color: "#90caf9", fontSize: "12px", marginBottom: "10px", fontWeight: "bold" }}>▶ Playback Controls</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                onClick={isPlaying ? pause : play}
                style={{ flex: 1, padding: "10px", background: isPlaying ? "#e53935" : "#43a047", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}
              >
                {isPlaying ? "⏸ Pause" : "▶ Replay"}
              </button>
              <button onClick={reset} style={{ padding: "10px 14px", background: "#1e2a3a", color: "#fff", border: "1px solid #42a5f5", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
                ↺
              </button>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: "#aaa" }}>Start</span>
                <span style={{ fontSize: "11px", color: "#aaa" }}>End</span>
              </div>
              <input
                type="range" min={0} max={timeline.length - 1} value={currentIndex}
                onChange={(e) => { pause(); setCurrentIndex(Number(e.target.value)); }}
                style={{ width: "100%", accentColor: "#1e88e5", cursor: "pointer" }}
              />
              <div style={{ textAlign: "center", fontSize: "12px", color: "#90caf9", marginTop: "4px" }}>
                {currentIndex + 1} / {timeline.length}
              </div>
            </div>

            <div>
              <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "6px" }}>Speed:</p>
              <div style={{ display: "flex", gap: "6px" }}>
                {[{ label: "0.5x", value: 2000 }, { label: "1x", value: 1000 }, { label: "2x", value: 500 }, { label: "5x", value: 200 }].map((s) => (
                  <button key={s.label} onClick={() => setSpeed(s.value)} style={{
                    flex: 1, padding: "6px",
                    background: speed === s.value ? "#1e88e5" : "#0d1b2a",
                    color: "#fff", border: "1px solid #2e3d4f", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {currentItem && (
            <div style={{ background: "#0d1b2a", borderRadius: "8px", padding: "12px", borderLeft: `4px solid ${getEventColor(currentItem.event)}` }}>
              <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#90caf9", fontWeight: "bold" }}>Current Step:</p>
              <p style={{ margin: "0 0 4px", fontSize: "13px" }}>Type: {currentItem.type}</p>
              {currentItem.event && (
                <p style={{ margin: "0 0 4px", fontSize: "13px", color: getEventColor(currentItem.event) }}>Event: {currentItem.event}</p>
              )}
              {currentItem.port  && <p style={{ margin: "0 0 4px", fontSize: "13px" }}>Port: {currentItem.port}</p>}
              {currentItem.speed && (
                <p style={{ margin: "0 0 4px", fontSize: "13px" }}>
                  Speed: {typeof currentItem.speed === "number" ? currentItem.speed.toFixed(1) : currentItem.speed} knots
                </p>
              )}
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#aaa" }}>{formatTime(currentItem.time)}</p>
            </div>
          )}

          <div>
            <p style={{ color: "#90caf9", fontSize: "12px", marginBottom: "10px", fontWeight: "bold" }}>
              📋 Timeline ({timeline.length} steps)
            </p>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {timeline.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => { pause(); setCurrentIndex(idx); }}
                  style={{
                    padding: "8px 10px", marginBottom: "4px", borderRadius: "6px",
                    cursor: "pointer",
                    background: idx === currentIndex ? "#1e88e5" : "#0d1b2a",
                    borderLeft: `3px solid ${getEventColor(item.event)}`,
                    fontSize: "12px",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    {item.type === "position" ? `📍 ${item.event || "Position"}` : `⚠ ${item.event?.toUpperCase()}`}
                  </div>
                  {item.port && <div style={{ color: "#90caf9" }}>{item.port}</div>}
                  <div style={{ color: "#aaa", fontSize: "11px" }}>{formatTime(item.time)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div style={{ background: "#1e2a3a", padding: "8px 20px", borderTop: "1px solid #2e3d4f" }}>
        <div style={{ background: "#0d1b2a", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
          <div style={{
            width: `${((currentIndex + 1) / timeline.length) * 100}%`,
            height: "100%", background: "#1e88e5", borderRadius: "4px", transition: "width 0.3s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "11px", color: "#aaa" }}>
          <span>{formatTime(timeline[0]?.time)}</span>
          <span>{Math.round(((currentIndex + 1) / timeline.length) * 100)}%</span>
          <span>{formatTime(timeline[timeline.length - 1]?.time)}</span>
        </div>
      </div>
    </div>
  );
};

export default VoyageReplay;