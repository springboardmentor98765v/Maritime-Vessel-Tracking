import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ALL_VESSELS = [
  {
    id: "1",
    imo_number: "IMO1234567",
    name: "MSC LUNA",
    vessel_type: "Container",
    flag: "India",
    cargo_type: "General Cargo",
    speed: 18.5,
    heading: 270,
    destination: "Mumbai",
    last_update: new Date().toISOString(),
    last_position_lat: 19.076,
    last_position_lon: 72.877,
    is_subscribed: false,
    // ── Backend vessel ID ──
    backend_id: 1,
    events: [
      {
        id: 1,
        event_type: "Departed",
        latitude: 19.076,
        longitude: 72.877,
        timestamp: new Date().toISOString(),
        details: "Vessel departed from Mumbai port",
      },
      {
        id: 2,
        event_type: "Stopped",
        latitude: 18.96,
        longitude: 72.82,
        timestamp: new Date().toISOString(),
        details: "Vessel stopped briefly near shore",
      },
    ],
  },
  {
    id: "2",
    imo_number: "IMO7654321",
    name: "OCEAN KING",
    vessel_type: "Tanker",
    flag: "China",
    cargo_type: "Oil",
    speed: 12.0,
    heading: 90,
    destination: "Chennai",
    last_update: new Date().toISOString(),
    last_position_lat: 13.08,
    last_position_lon: 80.27,
    is_subscribed: false,
    backend_id: 2,
    events: [
      {
        id: 1,
        event_type: "Departed",
        latitude: 13.08,
        longitude: 80.27,
        timestamp: new Date().toISOString(),
        details: "Vessel departed from Chennai port",
      },
      {
        id: 2,
        event_type: "Route Changed",
        latitude: 12.50,
        longitude: 79.80,
        timestamp: new Date().toISOString(),
        details: "Vessel changed route heading east",
      },
    ],
  },
  {
    id: "3",
    imo_number: "IMO1122334",
    name: "STAR VOYAGER",
    vessel_type: "Cargo",
    flag: "India",
    cargo_type: "Bulk",
    speed: 9.0,
    heading: 180,
    destination: "Kolkata",
    last_update: new Date().toISOString(),
    last_position_lat: 22.57,
    last_position_lon: 88.36,
    is_subscribed: false,
    backend_id: 1,
    events: [
      {
        id: 1,
        event_type: "Departed",
        latitude: 22.57,
        longitude: 88.36,
        timestamp: new Date().toISOString(),
        details: "Vessel departed from Kolkata port",
      },
      {
        id: 2,
        event_type: "Entered Port",
        latitude: 21.90,
        longitude: 88.00,
        timestamp: new Date().toISOString(),
        details: "Vessel entered intermediate port",
      },
    ],
  },
  {
    id: "4",
    imo_number: "IMO9988776",
    name: "PACIFIC DAWN",
    vessel_type: "Bulk Carrier",
    flag: "Panama",
    cargo_type: "Coal",
    speed: 0,
    heading: 45,
    destination: "Vizag",
    last_update: new Date().toISOString(),
    last_position_lat: 17.68,
    last_position_lon: 83.21,
    is_subscribed: false,
    backend_id: 1,
    events: [
      {
        id: 1,
        event_type: "Stopped",
        latitude: 17.68,
        longitude: 83.21,
        timestamp: new Date().toISOString(),
        details: "Vessel stopped at Vizag port",
      },
      {
        id: 2,
        event_type: "AIS Signal Lost",
        latitude: 17.50,
        longitude: 83.00,
        timestamp: new Date().toISOString(),
        details: "AIS signal lost for 10 minutes",
      },
    ],
  },
];

const mockSubscribeAPI = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) resolve({ success: true });
      else reject(new Error("API call failed"));
    }, 600);
  });
};

const VesselDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vessel, setVessel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const found = ALL_VESSELS.find((v) => v.id === String(id));
      if (found) {
        setVessel(found);
        setSubscribed(found.is_subscribed);
      } else {
        setVessel(null);
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSubscribe = async () => {
    if (subLoading || subscribed) return;
    setSubLoading(true);
    try {
      await mockSubscribeAPI();
      setSubscribed(true);
      showToast("🔔 Subscribed! You will receive alerts.", "success");
    } catch {
      showToast("❌ Failed to subscribe. Try again.", "error");
    } finally {
      setSubLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (subLoading) return;
    setSubLoading(true);
    try {
      await mockSubscribeAPI();
      setSubscribed(false);
      showToast("✅ Unsubscribed successfully", "success");
    } catch {
      showToast("❌ Failed to unsubscribe. Try again.", "error");
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: "40px",
        color: "#fff",
        background: "#0d1b2a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <div style={{
          width: "20px",
          height: "20px",
          border: "3px solid #42a5f5",
          borderTop: "3px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        Loading vessel data...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!vessel) {
    return (
      <div style={{
        padding: "40px",
        color: "#fff",
        background: "#0d1b2a",
        minHeight: "100vh",
      }}>
        <div style={{
          background: "#b71c1c",
          padding: "20px",
          borderRadius: "10px",
          maxWidth: "400px",
        }}>
          ❌ Vessel not found. ID {id} does not exist.
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            cursor: "pointer",
            background: "#1e2a3a",
            color: "#fff",
            border: "1px solid #42a5f5",
            borderRadius: "6px",
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="page-fade page-padding"
      style={{
        background: "#0d1b2a",
        minHeight: "100vh",
        color: "#fff",
        padding: "30px",
      }}
    >

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: toast.type === "success" ? "#2e7d32" : "#b71c1c",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "8px",
          zIndex: 9999,
          fontSize: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}>
          {toast.message}
        </div>
      )}

      {/* ── Back Button + Replay Button ── */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}>
        {/* ── Back Button ── */}
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            background: "#1e2a3a",
            color: "#fff",
            border: "1px solid #42a5f5",
            borderRadius: "6px",
          }}
        >
          ← Back
        </button>

        {/* ── Replay Voyage Button ── */}
        <button
          onClick={() => {
            // ── Use backend_id for API call ──
            const backendId = vessel.backend_id || 1;
            navigate(`/voyages/${backendId}/replay`);
          }}
          style={{
            padding: "8px 20px",
            background: "#9c27b0",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          🎬 Replay Voyage
        </button>
      </div>

      {/* ── Vessel Title ── */}
      <h1 style={{ marginBottom: "20px" }}>🚢 {vessel.name}</h1>

      {/* ── Metadata Grid ── */}
      <div
        className="vessel-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          background: "#1e2a3a",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <div><strong style={{ color: "#90caf9" }}>IMO:</strong> {vessel.imo_number}</div>
        <div><strong style={{ color: "#90caf9" }}>Type:</strong> {vessel.vessel_type}</div>
        <div><strong style={{ color: "#90caf9" }}>Flag:</strong> {vessel.flag}</div>
        <div><strong style={{ color: "#90caf9" }}>Cargo:</strong> {vessel.cargo_type}</div>
        <div><strong style={{ color: "#90caf9" }}>Speed:</strong> {vessel.speed} knots</div>
        <div><strong style={{ color: "#90caf9" }}>Heading:</strong> {vessel.heading}°</div>
        <div><strong style={{ color: "#90caf9" }}>Destination:</strong> {vessel.destination || "N/A"}</div>
        <div><strong style={{ color: "#90caf9" }}>Last Update:</strong> {new Date(vessel.last_update).toLocaleString()}</div>
        <div><strong style={{ color: "#90caf9" }}>Latitude:</strong> {vessel.last_position_lat}</div>
        <div><strong style={{ color: "#90caf9" }}>Longitude:</strong> {vessel.last_position_lon}</div>
      </div>

      {/* ── Subscription Section ── */}
      <div style={{
        background: "#1e2a3a",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h3 style={{ margin: "0 0 4px" }}>
            {subscribed ? "🔔 Subscribed" : "🔕 Not Subscribed"}
          </h3>
          <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>
            {subscribed
              ? "You will receive alerts for this vessel."
              : "Subscribe to receive alerts for this vessel."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={handleSubscribe}
            disabled={subLoading || subscribed}
            style={{
              padding: "10px 28px",
              background: subLoading ? "#555" : subscribed ? "#1565c0" : "#43a047",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              cursor: subLoading || subscribed ? "not-allowed" : "pointer",
              opacity: subLoading || subscribed ? 0.6 : 1,
              transition: "all 0.3s ease",
              minWidth: "160px",
            }}
          >
            {subLoading ? "⏳ Processing..." : subscribed ? "✅ Already Subscribed" : "🔔 Subscribe"}
          </button>

          {subscribed && (
            <button
              onClick={handleUnsubscribe}
              disabled={subLoading}
              style={{
                padding: "10px 28px",
                background: subLoading ? "#555" : "#e53935",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                cursor: subLoading ? "not-allowed" : "pointer",
                opacity: subLoading ? 0.6 : 1,
                transition: "all 0.3s ease",
                minWidth: "160px",
              }}
            >
              {subLoading ? "⏳ Processing..." : "🔕 Unsubscribe"}
            </button>
          )}
        </div>
      </div>

      {/* ── Event History ── */}
      <h2 style={{ marginBottom: "12px" }}>📋 Event History</h2>
      {vessel.events && vessel.events.length > 0 ? (
        <div className="table-responsive" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1e2a3a" }}>
                <th style={th}>Event Type</th>
                <th style={th}>Latitude</th>
                <th style={th}>Longitude</th>
                <th style={th}>Timestamp</th>
                <th style={th}>Details</th>
              </tr>
            </thead>
            <tbody>
              {vessel.events.map((evt) => (
                <tr key={evt.id} style={{ borderBottom: "1px solid #2e3d4f" }}>
                  <td style={td}>
                    <span className={
                      evt.event_type === "Stopped" ||
                      evt.event_type === "AIS Signal Lost"
                        ? "badge-stopped"
                        : "badge-active"
                    }>
                      {evt.event_type}
                    </span>
                  </td>
                  <td style={td}>{evt.latitude}</td>
                  <td style={td}>{evt.longitude}</td>
                  <td style={td}>{new Date(evt.timestamp).toLocaleString()}</td>
                  <td style={td}>{evt.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          background: "#1e2a3a",
          padding: "20px",
          borderRadius: "10px",
          color: "#aaa",
          textAlign: "center",
        }}>
          No events recorded for this vessel.
        </div>
      )}
    </div>
  );
};

const th = {
  padding: "10px",
  textAlign: "left",
  color: "#90caf9",
  fontWeight: "600",
  whiteSpace: "nowrap",
};

const td = {
  padding: "10px",
  color: "#ccc",
};

export default VesselDetail;
