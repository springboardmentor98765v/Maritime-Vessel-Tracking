import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Mock notifications — replace with real API when backend ready ──
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: "🚢 MSC LUNA has stopped moving near Mumbai.",
    is_read: false,
    created_at: new Date().toISOString(),
    vessel_name: "MSC LUNA",
    event_type: "Stopped",
  },
  {
    id: 2,
    message: "⚓ OCEAN KING has entered Chennai port.",
    is_read: false,
    created_at: new Date().toISOString(),
    vessel_name: "OCEAN KING",
    event_type: "Entered Port",
  },
  {
    id: 3,
    message: "📍 STAR VOYAGER changed route to Kolkata.",
    is_read: true,
    created_at: new Date().toISOString(),
    vessel_name: "STAR VOYAGER",
    event_type: "Route Changed",
  },
  {
    id: 4,
    message: "⚠ PACIFIC DAWN AIS signal lost.",
    is_read: false,
    created_at: new Date().toISOString(),
    vessel_name: "PACIFIC DAWN",
    event_type: "AIS Signal Lost",
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Mark single as read ──
  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  // ── Mark all as read ──
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // ── Filter notifications ──
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  // ── Event type color ──
  const getEventColor = (type) => {
    switch (type) {
      case "Stopped":         return "#e53935";
      case "Entered Port":    return "#43a047";
      case "Route Changed":   return "#fb8c00";
      case "AIS Signal Lost": return "#9c27b0";
      default:                return "#1e88e5";
    }
  };

  return (
    <div className="page-fade page-container">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="badge" style={{ background: "#e53935", marginLeft: "10px", fontSize: "13px" }}>
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="page-subtitle">Vessel events, alerts and status updates</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-primary">
              ✓ Mark All as Read
            </button>
          )}
          <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      {/* ── btn-group: stacks on mobile ── */}
      <div
        className="btn-group"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {["all", "unread", "read"].map((tab) => (
          // ── page-fade: tabs fade in ──
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="page-fade"
            style={{
              padding: "8px 20px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              background: filter === tab ? "#1e88e5" : "#1e2a3a",
              color: "#fff",
              fontWeight: filter === tab ? "bold" : "normal",
              fontSize: "13px",
              textTransform: "capitalize",
            }}
          >
            {tab === "all"
              ? `All (${notifications.length})`
              : tab === "unread"
              ? `Unread (${notifications.filter((n) => !n.is_read).length})`
              : `Read (${notifications.filter((n) => n.is_read).length})`}
          </button>
        ))}
      </div>

      {/* ── Notifications List ── */}
      {filteredNotifications.length === 0 ? (

        // ── Empty State ──
        // ── page-fade: fades in when empty ──
        <div
          className="page-fade"
          style={{
            background: "#1e2a3a",
            borderRadius: "10px",
            padding: "40px",
            textAlign: "center",
            color: "#aaa",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔕</div>
          <p style={{ fontSize: "16px" }}>
            {filter === "unread"
              ? "No unread notifications"
              : filter === "read"
              ? "No read notifications"
              : "No notifications yet"}
          </p>
        </div>

      ) : (

        // ── Notification Cards ──
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredNotifications.map((n) => (
            // ── page-fade: each card fades in ──
            // ── card-hover: hover lift animation ──
            <div
              key={n.id}
              className="page-fade card-hover"
              style={{
                background: n.is_read ? "#1e2a3a" : "#0d47a1",
                borderRadius: "10px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                borderLeft: `4px solid ${getEventColor(n.event_type)}`,
                opacity: n.is_read ? 0.7 : 1,
              }}
            >
              {/* ── Left: Message + Meta ── */}
              <div style={{ flex: 1 }}>

                {/* ── Event type badge ── */}
                <span style={{
                  background: getEventColor(n.event_type),
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  marginBottom: "8px",
                  display: "inline-block",
                }}>
                  {n.event_type}
                </span>

                {/* ── Message ── */}
                <p style={{
                  margin: "6px 0 4px",
                  fontSize: "14px",
                  color: "#fff",
                  lineHeight: "1.5",
                }}>
                  {n.message}
                </p>

                {/* ── Time ── */}
                <small style={{ color: "#90caf9", fontSize: "12px" }}>
                  {new Date(n.created_at).toLocaleString()}
                </small>
              </div>

              {/* ── Right: Action ── */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "8px",
              }}>
                {!n.is_read ? (
                  // ── btn-full: full width on mobile ──
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="btn-full"
                    style={{
                      padding: "6px 14px",
                      background: "#42a5f5",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✓ Mark as Read
                  </button>
                ) : (
                  <span style={{ color: "#66bb6a", fontSize: "12px" }}>
                    ✓ Read
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Notifications;