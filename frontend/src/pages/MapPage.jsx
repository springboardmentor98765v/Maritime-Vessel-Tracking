import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchVessels } from "../services/vesselService";

// Fix Leaflet's default icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom ship icon
const shipIcon = new L.DivIcon({
    html: `<span style="font-size:22px;filter:drop-shadow(0 2px 4px #0008)">🚢</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    className: "",
});

export default function MapPage() {
    const [vessels, setVessels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const loadVessels = async () => {
        setLoading(true);
        try {
            const data = await fetchVessels();
            setVessels(data.filter(v => v.last_position_lat != null && v.last_position_lon != null));
            setLastRefreshed(new Date().toLocaleTimeString());
        } catch (err) {
            console.error("Map load failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVessels();
        // Auto-refresh every 60 seconds
        const interval = setInterval(loadVessels, 60_000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="map-page">
            {/* Toolbar */}
            <div className="map-toolbar">
                <div className="map-toolbar-left">
                    <h1 className="map-title">🌊 Live Vessel Map</h1>
                    <span className="map-vessel-count">
                        {vessels.length} vessel{vessels.length !== 1 ? "s" : ""} with known position
                    </span>
                </div>
                <div className="map-toolbar-right">
                    {lastRefreshed && (
                        <span className="map-refresh-time">Last updated: {lastRefreshed}</span>
                    )}
                    <button className="button button--ghost button--sm" onClick={loadVessels} disabled={loading}>
                        {loading ? "Refreshing…" : "⟳ Refresh"}
                    </button>
                    <Link to="/vessels" className="button button--primary button--sm">
                        📋 Browse All
                    </Link>
                </div>
            </div>

            {/* Map */}
            <div className="map-container">
                {loading && vessels.length === 0 ? (
                    <div className="map-loading">Loading vessel positions…</div>
                ) : (
                    <MapContainer
                        center={[20, 0]}
                        zoom={2}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {vessels.map(v => (
                            <Marker
                                key={v.id}
                                position={[v.last_position_lat, v.last_position_lon]}
                                icon={shipIcon}
                            >
                                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                                    {v.name}
                                </Tooltip>
                                <Popup>
                                    <div className="map-popup">
                                        <strong>{v.name}</strong>
                                        <p>IMO: <span className="mono">{v.imo_number}</span></p>
                                        <p>Type: {v.type}</p>
                                        <p>Flag: {v.flag}</p>
                                        <p>Cargo: {v.cargo_type}</p>
                                        {v.operator && <p>Operator: {v.operator}</p>}
                                        {v.last_update && (
                                            <p className="popup-time">
                                                Updated: {new Date(v.last_update).toLocaleString()}
                                            </p>
                                        )}
                                        <Link to={`/vessels/${v.id}`} className="popup-link">
                                            View Details →
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    );
}
