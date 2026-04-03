import React, { useEffect, useState } from "react";
import { getNotifications } from "../api/axios";

const AlertPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await getNotifications();
      const data = res.data?.results || res.data || [];
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div>
      <h2 style={{ color: "white", marginBottom: "14px" }}>⚠ Active Risk Alerts</h2>

      {loading && <p style={{ color: "#cbd5e1" }}>Loading alerts...</p>}

      {!loading && alerts.length === 0 && (
        <p style={{ color: "#94a3b8" }}>No active alerts</p>
      )}

      {!loading && alerts.length > 0 && (
        <div style={{ display: "grid", gap: "12px" }}>
          {alerts.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              style={{
                background: "#1e2f4d",
                borderRadius: "10px",
                padding: "14px",
                color: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                <span>⚠ {alert.type || "Notification"}</span>
                <span style={{ fontSize: "13px", color: "#cbd5e1" }}>
                  {alert.created_at
                    ? new Date(alert.created_at).toLocaleTimeString()
                    : ""}
                </span>
              </div>

              <p style={{ margin: "0 0 6px 0" }}>
                <strong>Message:</strong> {alert.message || "No message"}
              </p>

              {"is_read" in alert && (
                <p style={{ margin: 0 }}>
                  <strong>Status:</strong> {alert.is_read ? "Read" : "Unread"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertPanel;