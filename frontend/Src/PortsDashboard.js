import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Mock port data — replace with API when backend ready ──
const MOCK_PORTS = [
  {
    id: 1,
    port: "Mumbai",
    arrivals: 120,
    departures: 115,
    congestion_score: 0.35,
    avg_wait_time: 4.5,
    last_analytics_update: new Date().toISOString(),
  },
  {
    id: 2,
    port: "Chennai",
    arrivals: 98,
    departures: 90,
    congestion_score: 0.41,
    avg_wait_time: 6.2,
    last_analytics_update: new Date().toISOString(),
  },
  {
    id: 3,
    port: "Kolkata",
    arrivals: 75,
    departures: 72,
    congestion_score: 0.22,
    avg_wait_time: 3.1,
    last_analytics_update: new Date().toISOString(),
  },
  {
    id: 4,
    port: "Vizag",
    arrivals: 60,
    departures: 55,
    congestion_score: 0.28,
    avg_wait_time: 2.8,
    last_analytics_update: new Date().toISOString(),
  },
  {
    id: 5,
    port: "Kochi",
    arrivals: 45,
    departures: 44,
    congestion_score: 0.15,
    avg_wait_time: 1.9,
    last_analytics_update: new Date().toISOString(),
  },
];

// ── Congestion color based on score ──
const getCongestionColor = (score) => {
  if (score >= 0.4) return "#e53935"; // red — high
  if (score >= 0.25) return "#fb8c00"; // orange — medium
  return "#43a047"; // green — low
};

const getCongestionLabel = (score) => {
  if (score >= 0.4) return "High";
  if (score >= 0.25) return "Medium";
  return "Low";
};

const PortsDashboard = () => {
  const navigate = useNavigate();
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPort, setSelectedPort] = useState(null);

  useEffect(() => {
    // ── Simulate API call ──
    setTimeout(() => {
      setPorts(MOCK_PORTS);
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return (
      <div style={{
        background: "#0d1b2a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        gap: "12px",
      }}>
        <div style={{
          width: "20px", height: "20px",
          border: "3px solid #42a5f5",
          borderTop: "3px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Loading port analytics...
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

      {/* ── Header ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "24px" }}>
            ⚓ Port Analytics Dashboard
          </h1>
          <p style={{ margin: 0, color: "#90caf9", fontSize: "14px" }}>
            Live port congestion and traffic statistics
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "8px 16px",
            background: "#1e2a3a",
            color: "#fff",
            border: "1px solid #42a5f5",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* ── Summary Stats ── */}
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
          {
            label: "Total Ports",
            value: ports.length,
            icon: "🏭",
            color: "#1e88e5",
          },
          {
            label: "Total Arrivals",
            value: ports.reduce((sum, p) => sum + p.arrivals, 0),
            icon: "🚢",
            color: "#43a047",
          },
          {
            label: "Total Departures",
            value: ports.reduce((sum, p) => sum + p.departures, 0),
            icon: "🛳️",
            color: "#fb8c00",
          },
          {
            label: "High Congestion",
            value: ports.filter((p) => p.congestion_score >= 0.4).length,
            icon: "⚠️",
            color: "#e53935",
          },
        ].map((stat) => (
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
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: stat.color,
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Port Cards ── */}
      <h2 style={{ marginBottom: "16px", color: "#90caf9" }}>
        🏭 Port Statistics
      </h2>
      <div
        className="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "30px",
        }}
      >
        {ports.map((port) => (
          <div
            key={port.id}
            className="card-hover"
            onClick={() => setSelectedPort(
              selectedPort?.id === port.id ? null : port
            )}
            style={{
              background: "#1e2a3a",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              border: selectedPort?.id === port.id
                ? "2px solid #42a5f5"
                : "2px solid transparent",
              transition: "border 0.2s ease",
            }}
          >
            {/* ── Port Name ── */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>
                ⚓ {port.port}
              </h3>
              <span style={{
                background: getCongestionColor(port.congestion_score),
                color: "#fff",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold",
              }}>
                {getCongestionLabel(port.congestion_score)}
              </span>
            </div>

            {/* ── Stats Row ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "16px",
            }}>
              <div style={{
                background: "#0d1b2a",
                borderRadius: "8px",
                padding: "10px",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#43a047",
                }}>
                  {port.arrivals}
                </div>
                <div style={{ fontSize: "12px", color: "#aaa" }}>
                  Arrivals
                </div>
              </div>
              <div style={{
                background: "#0d1b2a",
                borderRadius: "8px",
                padding: "10px",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#fb8c00",
                }}>
                  {port.departures}
                </div>
                <div style={{ fontSize: "12px", color: "#aaa" }}>
                  Departures
                </div>
              </div>
            </div>

            {/* ── Congestion Score Bar ── */}
            <div style={{ marginBottom: "8px" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}>
                <span style={{ fontSize: "12px", color: "#aaa" }}>
                  Congestion Score
                </span>
                <span style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: getCongestionColor(port.congestion_score),
                }}>
                  {port.congestion_score.toFixed(2)}
                </span>
              </div>
              {/* ── Progress bar ── */}
              <div style={{
                background: "#0d1b2a",
                borderRadius: "4px",
                height: "8px",
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${port.congestion_score * 100}%`,
                  height: "100%",
                  background: getCongestionColor(port.congestion_score),
                  borderRadius: "4px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>

            {/* ── Avg Wait Time ── */}
            <div style={{
              fontSize: "12px",
              color: "#90caf9",
              marginTop: "8px",
            }}>
              ⏱ Avg Wait Time: {port.avg_wait_time} hours
            </div>
          </div>
        ))}
      </div>

      {/* ── Port Details Table ── */}
      <div style={{
        background: "#1e2a3a",
        borderRadius: "12px",
        padding: "24px",
      }}>
        <h3 style={{ margin: "0 0 16px", color: "#90caf9" }}>
          📊 Detailed Port Statistics
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #2e3d4f" }}>
                <th style={th}>Port</th>
                <th style={th}>Arrivals</th>
                <th style={th}>Departures</th>
                <th style={th}>Congestion Score</th>
                <th style={th}>Avg Wait Time</th>
                <th style={th}>Status</th>
                <th style={th}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {ports.map((port) => (
                <tr
                  key={port.id}
                  style={{ borderBottom: "1px solid #2e3d4f" }}
                >
                  <td style={td}><strong>{port.port}</strong></td>
                  <td style={td}>
                    <span style={{ color: "#43a047", fontWeight: "bold" }}>
                      ↑ {port.arrivals}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{ color: "#fb8c00", fontWeight: "bold" }}>
                      ↓ {port.departures}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{
                      color: getCongestionColor(port.congestion_score),
                      fontWeight: "bold",
                    }}>
                      {port.congestion_score.toFixed(2)}
                    </span>
                  </td>
                  <td style={td}>{port.avg_wait_time} hrs</td>
                  <td style={td}>
                    <span style={{
                      background: getCongestionColor(port.congestion_score),
                      color: "#fff",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}>
                      {getCongestionLabel(port.congestion_score)}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{ color: "#aaa", fontSize: "12px" }}>
                      {new Date(
                        port.last_analytics_update
                      ).toLocaleTimeString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default PortsDashboard;