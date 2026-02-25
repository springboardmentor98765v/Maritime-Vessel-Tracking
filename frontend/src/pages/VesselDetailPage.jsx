import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchVessel,
    fetchVesselEvents,
    subscribeVessel,
    unsubscribeVessel,
    fetchSubscriptions,
} from "../services/vesselService";
import { useAuth } from "../hooks/useAuth";

const STATUS_LABELS = {
    0: "Under Way Using Engine",
    1: "At Anchor",
    5: "Moored",
    8: "In Inland Waterway",
};

export default function VesselDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [vessel, setVessel] = useState(null);
    const [events, setEvents] = useState([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subLoading, setSubLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [v, evts] = await Promise.all([fetchVessel(id), fetchVesselEvents(id)]);
                setVessel(v);
                setEvents(evts);
                if (isAuthenticated) {
                    const subs = await fetchSubscriptions();
                    setIsSubscribed(subs.some(s => s.vessel.id === parseInt(id)));
                }
            } catch (err) {
                console.error("Vessel load failed:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isAuthenticated]);

    const handleSubscribe = async () => {
        setSubLoading(true);
        try {
            if (isSubscribed) {
                await unsubscribeVessel(id);
                setIsSubscribed(false);
            } else {
                await subscribeVessel(id);
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error("Subscription toggle failed:", err);
        } finally {
            setSubLoading(false);
        }
    };

    if (loading) return <div className="detail-loading">Loading vessel…</div>;
    if (!vessel) return <div className="detail-error">Vessel not found.</div>;

    const hasPosition = vessel.last_position_lat != null && vessel.last_position_lon != null;

    return (
        <div className="vessel-detail">
            {/* Back */}
            <button className="button button--ghost mb-4" onClick={() => navigate(-1)}>
                ← Back
            </button>

            {/* Header */}
            <div className="vessel-detail-header">
                <div>
                    <h1 className="vessel-detail-name">{vessel.name}</h1>
                    <p className="vessel-detail-imo">IMO: <span className="mono">{vessel.imo_number}</span></p>
                </div>
                {isAuthenticated && (
                    <button
                        className={`button ${isSubscribed ? "button--danger" : "button--primary"}`}
                        onClick={handleSubscribe}
                        disabled={subLoading}
                    >
                        {subLoading ? "…" : isSubscribed ? "🔕 Unsubscribe" : "🔔 Subscribe to Alerts"}
                    </button>
                )}
            </div>

            {/* Metadata Grid */}
            <div className="vessel-detail-grid">
                {[
                    ["Type", vessel.type],
                    ["Flag", vessel.flag],
                    ["Cargo Type", vessel.cargo_type],
                    ["Speed", vessel.speed != null ? `${vessel.speed} knots` : "Unknown"],
                    ["Heading", vessel.heading != null ? `${vessel.heading}°` : "Unknown"],
                    ["Destination", vessel.destination || "Unknown"],
                    ["Operator", vessel.operator || "—"],
                    ["Last Updated", vessel.last_update ? new Date(vessel.last_update).toLocaleString() : "Unknown"],
                    ["Position", hasPosition
                        ? `${Number(vessel.last_position_lat).toFixed(5)}°, ${Number(vessel.last_position_lon).toFixed(5)}°`
                        : "Not Available"],
                ].map(([label, value]) => (
                    <div className="vessel-detail-card" key={label}>
                        <p className="detail-label">{label}</p>
                        <p className="detail-value">{value}</p>
                    </div>
                ))}
            </div>

            {/* Map Preview (if position known) */}
            {hasPosition && (
                <div className="vessel-map-preview">
                    <h2>Last Known Position</h2>
                    <p className="mono">
                        {vessel.last_position_lat.toFixed(5)}° N, {vessel.last_position_lon.toFixed(5)}° E
                    </p>
                    <a
                        href={`https://www.openstreetmap.org/?mlat=${vessel.last_position_lat}&mlon=${vessel.last_position_lon}&zoom=8`}
                        target="_blank"
                        rel="noreferrer"
                        className="button button--ghost"
                    >
                        View on OpenStreetMap ↗
                    </a>
                </div>
            )}

            {/* Events */}
            <div className="vessel-events">
                <h2>Recent Events</h2>
                {events.length === 0 ? (
                    <p className="text-muted">No recorded events for this vessel.</p>
                ) : (
                    <div className="events-list">
                        {events.map(ev => (
                            <div key={ev.id} className={`event-card event-card--${ev.event_type}`}>
                                <div className="event-header">
                                    <span className="event-type-badge">{ev.event_type}</span>
                                    <span className="event-time">{new Date(ev.timestamp).toLocaleString()}</span>
                                </div>
                                {ev.location && <p className="event-location">📍 {ev.location}</p>}
                                {ev.details && <p className="event-details">{ev.details}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
