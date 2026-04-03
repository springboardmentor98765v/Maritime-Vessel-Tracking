import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import API from "../api/axios";

import L from "leaflet";

const startIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [30, 30],
});

const endIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [30, 30],
});
function FixMapResize() {
  const map = useMap();

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(map.getContainer());

    return () => resizeObserver.disconnect();
  }, [map]);

  return null;
}

function FollowMarker({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.panTo(position);
    }
  }, [position, map]);

  return null;
}

export default function ReplayMap({ vesselId, vesselName, onClose }) {
  const [path, setPath] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [speed, setSpeed] = useState(800);
  const intervalRef = useRef(null);

  const positions = path.filter((p) => p.type === "position");
  const events = path.filter((p) => p.type !== "position");
  const current = positions[index];
  const start = positions[0];
  const end = positions[positions.length - 1];
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(`/api/voyage/${vesselId}/history/`);

        const cleaned = (res.data || [])
          .map((p) => ({
            ...p,
            lat: Number(p.lat),
            lon: Number(p.lon),
          }))
          .filter((p) => !isNaN(p.lat) && !isNaN(p.lon));

        setPath(cleaned);
      } catch (err) {
        console.error("Replay fetch error:", err);
        setError("Failed to load replay data.");
      } finally {
        setLoading(false);
      }
    };

    if (vesselId) {
      fetchHistory();
    }
  }, [vesselId]);

  useEffect(() => {
    if (!playing || positions.length === 0) return;

    intervalRef.current = setInterval(() => {
      setIndex((prev) => {
        if (prev >= positions.length - 1) {
          clearInterval(intervalRef.current);
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [playing, positions.length]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [vesselId]);

  if (loading) return <p>Loading replay...</p>;
  if (error) return <p>{error}</p>;
  if (!positions.length) return <p>No replay data</p>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px",
          background: "#0f172a",
          color: "white",
        }}
        
      >
        <select onChange={(e) => setSpeed(Number(e.target.value))}>
          <option value={1200}>Slow</option>
          <option value={800}>Normal</option>
          <option value={300}>Fast</option>
        </select>
        <button 
          onClick={() => setPlaying(true)} 
          disabled={playing || index === positions.length - 1}
        >
          ▶ Play
        </button>

        <button 
          onClick={() => setPlaying(false)} 
          disabled={!playing}
        >
          ⏸ Pause
        </button>
        <button onClick={() => {
          setIndex(0);
          setPlaying(false);
        }}>
          🔄 Reset
        </button>

        <input
          type="range"
          min="0"
          max={positions.length - 1}
          value={index}
          onChange={(e) => {
            setIndex(Number(e.target.value));
            setPlaying(false);
          }}
          style={{ flex: 1 }}
        />

        <span>
          {index + 1} / {positions.length}
        </span>
      </div>

      <div style={{ position: "relative" }}>
        <MapContainer
          center={[positions[0].lat, positions[0].lon]}
          zoom={5}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FixMapResize />

          <Polyline
            positions={positions.slice(0, index + 1).map((p) => [p.lat, p.lon])}
            pathOptions={{
              color: "#2c4568",
              weight: 5,
              opacity: 0.9,
            }}
          />

          {current && <FollowMarker position={[current.lat, current.lon]} />}

          {current && (
            <Marker position={[current.lat, current.lon]}>
              <Popup>
                <b>{vesselName || `Vessel ${vesselId}`}</b>
                <br />
                Lat: {current.lat}
                <br />
                Lon: {current.lon}
                <br />
                Time: {current.time ? new Date(current.time).toLocaleString() : "N/A"}
              </Popup>
            </Marker>
          )}

          {events.map((e, i) => (
            <Marker key={i} position={[e.lat, e.lon]}>
              <Popup>
                <b>{String(e.type || "event").toUpperCase()}</b>
                <br />
                Time: {e.time ? new Date(e.time).toLocaleString() : "N/A"}
              </Popup>
            </Marker>
          ))}
          {/* START */}
        {start && (
          <Marker position={[start.lat, start.lon]} icon={startIcon}>
            <Popup>
              <b>🚀 START</b><br />
              {new Date(start.time).toLocaleString()}
            </Popup>
          </Marker>
        )}

        {/* END */}
        {end && (
          <Marker position={[end.lat, end.lon]} icon={endIcon}>
            <Popup>
              <b>🏁 END</b><br />
              {new Date(end.time).toLocaleString()}
            </Popup>
          </Marker>
        )}
          
        </MapContainer>

        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.85)",
            color: "white",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <div>
            <b>Vessel name:</b> {vesselName || vesselId}
          </div>
          {current && (
            <>
              <div>
                <b>Lat:</b> {current.lat}
              </div>
              <div>
                <b>Lon:</b> {current.lon}
              </div>
              <div>
                <b>Time:</b>{" "}
                {current.time ? new Date(current.time).toLocaleString() : "N/A"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}