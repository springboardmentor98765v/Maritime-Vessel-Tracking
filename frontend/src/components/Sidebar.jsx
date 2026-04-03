import { NavLink } from "react-router-dom";
import { useState } from "react";
export default function Sidebar({ role }) {
  const [isOpen, setIsOpen] = useState(false);

  const safeRole = role?.toLowerCase();
  const base = `/${safeRole}`;

  const menuItems = [
    { label: "Dashboard", path: `${base}`, icon: "🏠" },
    { label: "Vessels", path: `${base}/vessels`, icon: "🚢" },
    { label: "Live Map", path: `${base}/map`, icon: "🗺️" },
    { label: "Ports", path: `${base}/ports`, icon: "⚓" },
    { label: "Port Analytics", path: `${base}/portcharts`, icon: "📈" },

    ...(safeRole === "admin"
      ? [{ label: "Admin Panel", path: `${base}/admin`, icon: "⚙" }]
      : []),
  ];
  
  
  return (
    <div
      className="sidebar"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      style={{
        width: isOpen ? "190px" : "70px",
        minHeight: "100vh",
        background: "#0b1736",
        color: "white",
        transition: "width 0.3s ease",
        overflow: "hidden",
        padding: "15px 10px",
        boxSizing: "border-box",
        
      }}
    >
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        {isOpen ? (
          <h2 style={{ margin: 0 }}>🚢 Maritime</h2>
        ) : (
          <span style={{ fontSize: "24px" }}>🚢</span>
        )}
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {menuItems.map((item) => (
          <li key={item.path} style={{ marginBottom: "10px" }}>
            <NavLink
              to={item.path}
              end={item.path === base}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textDecoration: "none",
                color: "white",
                padding: "10px",
                borderRadius: "8px",
                background: isActive ? "#1e293b" : "transparent",
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              <span style={{ minWidth: "20px", textAlign: "center" }}>
                {item.icon}
              </span>

              {isOpen && <span>{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
