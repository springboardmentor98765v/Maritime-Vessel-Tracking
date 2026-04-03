import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// ── Mock notifications — replace with GET /api/notifications/ when backend ready ──
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: "🚢 MSC LUNA has stopped moving near Mumbai.",
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    message: "⚓ OCEAN KING has entered Chennai port.",
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    message: "📍 STAR VOYAGER changed route to Kolkata.",
    is_read: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    type: "storm_alert",
    message: "⚠ Storm Warning — Vessel MSC LUNA entering severe weather zone",
    vessel: "MSC LUNA",
    severity: "High",
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    type: "piracy_alert",
    message: "⚠ Piracy Warning — OCEAN KING approaching piracy zone near Chennai",
    vessel: "OCEAN KING",
    severity: "Medium",
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

// ── Navigation items ──
const NAV_ITEMS = [
  { label: "Dashboard",        path: "/dashboard",        icon: "📊" },
  { label: "Live Tracking Map",path: "/live-tracking",    icon: "🌍" },
  { label: "Port Analysis",    path: "/port-analysis",    icon: "⚓" },
  { label: "Ships Growth",     path: "/ships-growth",     icon: "📈" },
  { label: "Company Dashboard",path: "/company-dashboard",icon: "🏢" },
  { label: "Port Dashboard",   path: "/port-dashboard",   icon: "🏭" },
  { label: "Admin Panel",      path: "/admin-panel",      icon: "🛠️" },
];

function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount    = notifications.filter((n) => !n.is_read).length;
  const riskAlertCount = notifications.filter(
    (n) => !n.is_read && (n.type === "storm_alert" || n.type === "piracy_alert")
  ).length;

  // ── Close dropdown when clicking outside ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Auto-fetch notifications every 30 seconds (replace with real API) ──
  useEffect(() => {
    const interval = setInterval(() => {
      // When backend ready replace with:
      // getNotifications().then(data => setNotifications(data));
      console.log("🔔 Polling notifications…");
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getSeverityColor  = (s) => s === "High" ? "#b71c1c" : s === "Medium" ? "#e65100" : "#f57f17";
  const getSeverityBorder = (s) => s === "High" ? "#e53935" : s === "Medium" ? "#fb8c00" : "#fdd835";

  // ── Check if path is active ──
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div style={styles.sidebar}>

      {/* ── Brand + Bell ── */}
      <div style={styles.titleRow}>
        <div>
          <div style={{ fontSize: "20px", marginBottom: "0" }}>🚢</div>
          <h2 style={styles.title}>Maritime</h2>
        </div>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            id="notification-bell"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={styles.bellButton}
            title="Notifications"
          >
            <span style={{
              fontSize: "20px",
              filter: riskAlertCount > 0 ? "drop-shadow(0 0 4px #e53935)" : "none",
            }}>
              🔔
            </span>
            {unreadCount > 0 && (
              <span style={{
                ...styles.badge,
                background: riskAlertCount > 0 ? "#e53935" : "#1e88e5",
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontWeight: "600" }}>🔔 Notifications</span>
                  {riskAlertCount > 0 && (
                    <span style={{ fontSize: "11px", color: "#e53935", fontWeight: "bold" }}>
                      ⚠ {riskAlertCount} risk alert{riskAlertCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} style={styles.markAllBtn}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={styles.notifList}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyState}>No notifications yet</div>
                ) : (
                  notifications.map((n) => {
                    const isRiskAlert = n.type === "storm_alert" || n.type === "piracy_alert";
                    return (
                      <div
                        key={n.id}
                        style={{
                          ...styles.notifItem,
                          background: isRiskAlert
                            ? (n.is_read ? "#2e3d4f" : getSeverityColor(n.severity))
                            : (n.is_read ? "#2e3d4f" : "#0d47a1"),
                          borderLeft: isRiskAlert
                            ? `4px solid ${getSeverityBorder(n.severity)}`
                            : "4px solid transparent",
                        }}
                      >
                        {isRiskAlert && !n.is_read && (
                          <div style={{
                            display: "inline-block",
                            background: getSeverityBorder(n.severity),
                            color: "#fff", fontSize: "10px",
                            padding: "1px 6px", borderRadius: "4px",
                            marginBottom: "4px", fontWeight: "bold",
                          }}>
                            {n.severity} RISK
                          </div>
                        )}
                        {isRiskAlert && n.vessel && (
                          <div style={{ fontSize: "11px", color: "#ffcc80", marginBottom: "2px", fontWeight: "bold" }}>
                            🚢 {n.vessel}
                          </div>
                        )}
                        <p style={styles.notifMessage}>{n.message}</p>
                        <small style={styles.notifTime}>
                          {new Date(n.created_at).toLocaleTimeString()}
                        </small>
                        {!n.is_read && (
                          <button onClick={() => handleMarkRead(n.id)} style={styles.markReadBtn}>
                            ✓ Mark as read
                          </button>
                        )}
                        {n.is_read && (
                          <span style={styles.readLabel}>✓ Read</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div style={styles.dropdownFooter}>
                <Link
                  to="/notifications"
                  onClick={() => setDropdownOpen(false)}
                  style={styles.viewAllLink}
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation Menu ── */}
      <nav style={{ flex: 1 }}>
        <ul style={styles.menu}>
          {NAV_ITEMS.map(({ label, path, icon }) => {
            const active = isActive(path);
            return (
              <li key={path} style={{ marginBottom: "2px" }}>
                <Link
                  to={path}
                  style={{
                    ...styles.link,
                    background: active ? "rgba(66,165,245,0.15)" : "transparent",
                    borderLeft: active ? "3px solid #42a5f5" : "3px solid transparent",
                    color: active ? "#42a5f5" : "#ccc",
                    paddingLeft: active ? "13px" : "16px",
                    fontWeight: active ? "600" : "400",
                    borderRadius: "0 6px 6px 0",
                  }}
                >
                  <span style={{ marginRight: "8px" }}>{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}

          {/* Notifications with badge */}
          <li style={{ marginBottom: "2px" }}>
            <Link
              to="/notifications"
              style={{
                ...styles.link,
                background: isActive("/notifications") ? "rgba(66,165,245,0.15)" : "transparent",
                borderLeft: isActive("/notifications") ? "3px solid #42a5f5" : "3px solid transparent",
                color: isActive("/notifications") ? "#42a5f5" : "#ccc",
                paddingLeft: isActive("/notifications") ? "13px" : "16px",
                fontWeight: isActive("/notifications") ? "600" : "400",
                borderRadius: "0 6px 6px 0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                <span style={{ marginRight: "8px" }}>🔔</span>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  ...styles.menuBadge,
                  background: riskAlertCount > 0 ? "#e53935" : "#1e88e5",
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>
          </li>
        </ul>
      </nav>

      {/* ── Logout ── */}
      <div style={{ paddingTop: "12px", borderTop: "1px solid #1e2a3a" }}>
        <button
          id="sidebar-logout"
          style={styles.logout}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "230px",
    minWidth: "230px",
    height: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "20px 0",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    borderRight: "1px solid #1e2a3a",
    overflowY: "auto",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    padding: "0 16px 16px",
    borderBottom: "1px solid #1e2a3a",
  },

  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
    letterSpacing: "0.5px",
  },

  bellButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    position: "relative",
    padding: "6px",
    borderRadius: "6px",
    transition: "background 0.2s",
  },

  badge: {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    color: "#fff",
    borderRadius: "50%",
    fontSize: "9px",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  dropdown: {
    position: "absolute",
    top: "40px",
    right: "-8px",
    background: "#1e2a3a",
    width: "300px",
    borderRadius: "10px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    zIndex: 9999,
    overflow: "hidden",
    border: "1px solid #2e3d4f",
  },

  dropdownHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #2e3d4f",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
    fontSize: "14px",
  },

  markAllBtn: {
    background: "none",
    border: "1px solid #42a5f5",
    color: "#42a5f5",
    padding: "3px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
  },

  notifList: {
    maxHeight: "300px",
    overflowY: "auto",
    padding: "8px",
  },

  notifItem: {
    padding: "10px 12px",
    marginBottom: "6px",
    borderRadius: "8px",
    color: "#fff",
  },

  notifMessage: {
    margin: "0 0 4px",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  notifTime: {
    color: "#90caf9",
    fontSize: "11px",
    display: "block",
    marginBottom: "6px",
  },

  markReadBtn: {
    background: "#42a5f5",
    border: "none",
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
  },

  readLabel: {
    color: "#66bb6a",
    fontSize: "11px",
  },

  emptyState: {
    padding: "20px",
    textAlign: "center",
    color: "#aaa",
    fontSize: "13px",
  },

  dropdownFooter: {
    padding: "10px 16px",
    borderTop: "1px solid #2e3d4f",
    textAlign: "center",
  },

  viewAllLink: {
    color: "#42a5f5",
    textDecoration: "none",
    fontSize: "13px",
  },

  menu: {
    listStyle: "none",
    padding: "0 0 16px",
    margin: 0,
  },

  link: {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    color: "#ccc",
    textDecoration: "none",
    fontSize: "14px",
    transition: "background 0.15s, color 0.15s, border-color 0.15s",
  },

  menuBadge: {
    color: "#fff",
    borderRadius: "10px",
    fontSize: "10px",
    padding: "2px 6px",
    fontWeight: "bold",
  },

  logout: {
    margin: "0 16px",
    padding: "10px",
    width: "calc(100% - 32px)",
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#ef4444",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.2s",
  },
};

export default Sidebar;