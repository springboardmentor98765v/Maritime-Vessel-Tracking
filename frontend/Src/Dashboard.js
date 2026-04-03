import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // ── Update clock every second ──
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    // ── page-fade: fade in animation on page load ──
    <div
      className="page-fade page-padding"
      style={{
        background: "#0d1b2a",
        minHeight: "100vh",
        color: "#fff",
        padding: "30px",
      }}
    >

      {/* ── Welcome Header ── */}
      <div
        className="card-hover"
        style={{
          background: "#1e2a3a",
          borderRadius: "12px",
          padding: "24px 30px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: "24px" }}>
            🚢 Maritime Vessel Tracking
          </h1>
          <p style={{ margin: 0, color: "#90caf9", fontSize: "14px" }}>
            Welcome to your maritime dashboard
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#42a5f5" }}>
            {currentTime.toLocaleTimeString()}
          </div>
          <div style={{ fontSize: "12px", color: "#aaa" }}>
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* ── Stats Cards ──
          dashboard-grid: becomes single column on tablet
      ── */}
      <div
        className="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total Vessels",   value: "4", icon: "🚢", color: "#1e88e5" },
          { label: "Active Vessels",  value: "3", icon: "✅", color: "#43a047" },
          { label: "Stopped Vessels", value: "1", icon: "⛔", color: "#e53935" },
          { label: "Notifications",   value: "2", icon: "🔔", color: "#fb8c00" },
        ].map((stat) => (
          // ── card-hover: lift effect on hover ──
          <div
            key={stat.label}
            className="card-hover"
            style={{
              background: "#1e2a3a",
              borderRadius: "10px",
              padding: "20px",
              borderLeft: `4px solid ${stat.color}`,
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Action Buttons ── */}
      <div
        className="card-hover"
        style={{
          background: "#1e2a3a",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 16px", color: "#90caf9" }}>⚡ Quick Actions</h3>

        {/* ── btn-group: stacks vertically on mobile ── */}
        <div
          className="btn-group"
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "🌍 Live Tracking Map", path: "/live-tracking", color: "#1e88e5" },
            { label: "⚓ Port Analysis",     path: "/port-analysis",  color: "#43a047" },
            { label: "📈 Ships Growth",      path: "/ships-growth",   color: "#fb8c00" },
            { label: "🔔 Notifications",     path: "/notifications",  color: "#9c27b0" },
          ].map((action) => (
            // ── btn-full: full width on mobile ──
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="btn-full"
              style={{
                padding: "12px 20px",
                background: action.color,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "opacity 0.2s, transform 0.1s",
              }}
              onMouseEnter={(e) => e.target.style.opacity = "0.8"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Vessel Summary Table ── */}
      <div
        className="card-hover"
        style={{
          background: "#1e2a3a",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 16px", color: "#90caf9" }}>
          🚢 Vessel Summary
        </h3>

        {/* ── overflowX auto for tablet/mobile table scroll ── */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2e3d4f" }}>
                <th style={th}>Vessel Name</th>
                <th style={th}>Type</th>
                <th style={th}>Flag</th>
                <th style={th}>Speed</th>
                <th style={th}>Destination</th>
                <th style={th}>Status</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 1, name: "MSC LUNA",     type: "Container",    flag: "India",  speed: 18.5, destination: "Mumbai",  status: "Active"  },
                { id: 2, name: "OCEAN KING",   type: "Tanker",       flag: "China",  speed: 12.0, destination: "Chennai", status: "Active"  },
                { id: 3, name: "STAR VOYAGER", type: "Cargo",        flag: "India",  speed: 9.0,  destination: "Kolkata", status: "Active"  },
                { id: 4, name: "PACIFIC DAWN", type: "Bulk Carrier", flag: "Panama", speed: 0,    destination: "Vizag",   status: "Stopped" },
              ].map((vessel) => (
                <tr
                  key={vessel.id}
                  className="slide-in"
                  style={{ borderBottom: "1px solid #2e3d4f" }}
                >
                  <td style={td}>{vessel.name}</td>
                  <td style={td}>{vessel.type}</td>
                  <td style={td}>{vessel.flag}</td>
                  <td style={td}>{vessel.speed} knots</td>
                  <td style={td}>{vessel.destination}</td>
                  <td style={td}>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      background: vessel.status === "Active" ? "#1b5e20" : "#b71c1c",
                      color: "#fff",
                    }}>
                      {vessel.status}
                    </span>
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => navigate(`/vessel/${vessel.id}`)}
                      className="btn-full"
                      style={{
                        padding: "4px 12px",
                        background: "#1e88e5",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── System Status ── */}
      <div
        className="card-hover"
        style={{
          background: "#1e2a3a",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 16px", color: "#90caf9" }}>
          🖥️ System Status
        </h3>

        {/* ── dashboard-grid: single column on tablet ── */}
        <div
          className="dashboard-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            { label: "API Connection", status: "Mock Data", ok: true  },
            { label: "Map Service",    status: "Online",    ok: true  },
            { label: "Auto Refresh",   status: "Every 30s", ok: true  },
            { label: "Backend API",    status: "Pending",   ok: false },
          ].map((item) => (
            // ── card-hover: lift effect on hover ──
            <div
              key={item.label}
              className="card-hover"
              style={{
                background: "#0d1b2a",
                borderRadius: "8px",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "13px", color: "#ccc" }}>
                {item.label}
              </span>
              <span style={{
                fontSize: "12px",
                color: item.ok ? "#66bb6a" : "#ffa726",
                fontWeight: "bold",
              }}>
                {item.ok ? "✅" : "⚠️"} {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const th = {
  padding: "10px 12px",
  textAlign: "left",
  color: "#90caf9",
  fontWeight: "600",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const td = {
  padding: "10px 12px",
  color: "#ccc",
  fontSize: "13px",
};

export default Dashboard;
