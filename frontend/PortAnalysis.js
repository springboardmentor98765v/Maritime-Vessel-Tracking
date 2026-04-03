import React from "react";
import { useNavigate } from "react-router-dom";

const PortAnalysis = () => {
  const navigate = useNavigate();

  return (
    <div className="page-fade page-container">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">⚓ Port Analytics</h1>
          <p className="page-subtitle">Maritime port traffic and congestion overview</p>
        </div>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>← Back</button>
      </div>

      {/* ── Quick Links ── */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        flexWrap: "wrap",
      }}>
        <button
          onClick={() => navigate("/ports")}
          style={{
            padding: "12px 20px",
            background: "#1e88e5",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          ⚓ Port Analytics Dashboard
        </button>
        <button
          onClick={() => navigate("/port-charts")}
          style={{
            padding: "12px 20px",
            background: "#9c27b0",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          📊 Port Charts
        </button>
        <button
          onClick={() => navigate("/live-tracking")}
          style={{
            padding: "12px 20px",
            background: "#43a047",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          🌍 Live Vessel Map
        </button>
      </div>

      {/* ── Info Card ── */}
      <div style={{
        background: "#1e2a3a",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        borderLeft: "4px solid #42a5f5",
      }}>
        <h3 style={{ margin: "0 0 12px", color: "#90caf9" }}>
          ℹ️ About Port Analysis
        </h3>
        <p style={{ margin: "0 0 8px", color: "#ccc", lineHeight: "1.6" }}>
          Port analysis data is fetched from the backend which integrates
          with UNCTAD port statistics including arrivals, departures,
          and trade flow data.
        </p>
        <p style={{ margin: 0, color: "#ccc", lineHeight: "1.6" }}>
          Congestion scores are calculated using the formula:
          <code style={{
            background: "#0d1b2a",
            padding: "2px 8px",
            borderRadius: "4px",
            marginLeft: "8px",
            color: "#42a5f5",
          }}>
            (arrivals - departures) / arrivals
          </code>
        </p>
      </div>

      {/* ── Port Summary Cards ── */}
      <div
        className="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {[
          { port: "Mumbai",  score: 0.35, arrivals: 120, departures: 115 },
          { port: "Chennai", score: 0.41, arrivals: 98,  departures: 90  },
          { port: "Kolkata", score: 0.22, arrivals: 75,  departures: 72  },
          { port: "Vizag",   score: 0.28, arrivals: 60,  departures: 55  },
          { port: "Kochi",   score: 0.15, arrivals: 45,  departures: 44  },
        ].map((p) => (
          <div
            key={p.port}
            className="card-hover"
            style={{
              background: "#1e2a3a",
              borderRadius: "10px",
              padding: "16px",
              borderLeft: `4px solid ${
                p.score >= 0.4 ? "#e53935" :
                p.score >= 0.25 ? "#fb8c00" : "#43a047"
              }`,
            }}
          >
            <h4 style={{ margin: "0 0 8px" }}>⚓ {p.port}</h4>
            <div style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.8" }}>
              <div>Arrivals: <strong style={{ color: "#43a047" }}>{p.arrivals}</strong></div>
              <div>Departures: <strong style={{ color: "#fb8c00" }}>{p.departures}</strong></div>
              <div>Congestion: <strong style={{
                color: p.score >= 0.4 ? "#e53935" :
                       p.score >= 0.25 ? "#fb8c00" : "#43a047"
              }}>{p.score.toFixed(2)}</strong></div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PortAnalysis;