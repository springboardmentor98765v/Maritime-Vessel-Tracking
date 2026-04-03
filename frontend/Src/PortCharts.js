import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadialBarChart, RadialBar,
} from "recharts";

// ── Mock data ──
const MOCK_PORT_CHART_DATA = [
  { port: "Mumbai",  arrivals: 120, departures: 115, congestion: 0.35 },
  { port: "Chennai", arrivals: 98,  departures: 90,  congestion: 0.41 },
  { port: "Kolkata", arrivals: 75,  departures: 72,  congestion: 0.22 },
  { port: "Vizag",   arrivals: 60,  departures: 55,  congestion: 0.28 },
  { port: "Kochi",   arrivals: 45,  departures: 44,  congestion: 0.15 },
];

const PortCharts = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setData(MOCK_PORT_CHART_DATA);
      setLoading(false);
    }, 500);
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
      }}>
        Loading charts...
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
          <h1 style={{ margin: "0 0 4px" }}>📊 Port Analytics Charts</h1>
          <p style={{ margin: 0, color: "#90caf9", fontSize: "14px" }}>
            Visual analytics for port traffic and congestion
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/ports")}
            style={{
              padding: "8px 16px",
              background: "#1e88e5",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ⚓ Port Dashboard
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "8px 16px",
              background: "#1e2a3a",
              color: "#fff",
              border: "1px solid #42a5f5",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* ── Chart 1 — Arrivals vs Departures ── */}
      <div style={{
        background: "#1e2a3a",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
      }}>
        <h3 style={{ margin: "0 0 20px", color: "#90caf9" }}>
          📈 Chart 1 — Arrivals vs Departures
        </h3>
        <p style={{ margin: "0 0 16px", color: "#aaa", fontSize: "13px" }}>
          Shows traffic activity at each port
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3d4f" />
            <XAxis
              dataKey="port"
              stroke="#90caf9"
              tick={{ fill: "#ccc", fontSize: 12 }}
            />
            <YAxis
              stroke="#90caf9"
              tick={{ fill: "#ccc", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "#1e2a3a",
                border: "1px solid #42a5f5",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend
              wrapperStyle={{ color: "#ccc", fontSize: "13px" }}
            />
            <Bar
              dataKey="arrivals"
              name="Arrivals"
              fill="#43a047"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="departures"
              name="Departures"
              fill="#fb8c00"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Chart 2 — Congestion Score ── */}
      <div style={{
        background: "#1e2a3a",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
      }}>
        <h3 style={{ margin: "0 0 20px", color: "#90caf9" }}>
          🌡️ Chart 2 — Congestion Score by Port
        </h3>
        <p style={{ margin: "0 0 16px", color: "#aaa", fontSize: "13px" }}>
          Higher score means more congestion
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3d4f" />
            <XAxis
              dataKey="port"
              stroke="#90caf9"
              tick={{ fill: "#ccc", fontSize: 12 }}
            />
            <YAxis
              stroke="#90caf9"
              tick={{ fill: "#ccc", fontSize: 12 }}
              domain={[0, 1]}
            />
            <Tooltip
              contentStyle={{
                background: "#1e2a3a",
                border: "1px solid #e53935",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value) => [value.toFixed(2), "Congestion Score"]}
            />
            <Bar
              dataKey="congestion"
              name="Congestion Score"
              radius={[4, 4, 0, 0]}
              fill="#e53935"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* ── Congestion Legend ── */}
        <div style={{
          display: "flex",
          gap: "20px",
          marginTop: "16px",
          flexWrap: "wrap",
        }}>
          {[
            { label: "Low (< 0.25)",    color: "#43a047" },
            { label: "Medium (0.25-0.4)", color: "#fb8c00" },
            { label: "High (> 0.4)",    color: "#e53935" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                background: item.color,
              }} />
              <span style={{ fontSize: "12px", color: "#ccc" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart 3 — Traffic Trend Line ── */}
      <div style={{
        background: "#1e2a3a",
        borderRadius: "12px",
        padding: "24px",
      }}>
        <h3 style={{ margin: "0 0 20px", color: "#90caf9" }}>
          📉 Chart 3 — Traffic Trend Overview
        </h3>
        <p style={{ margin: "0 0 16px", color: "#aaa", fontSize: "13px" }}>
          Arrivals vs Departures trend across ports
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3d4f" />
            <XAxis
              dataKey="port"
              stroke="#90caf9"
              tick={{ fill: "#ccc", fontSize: 12 }}
            />
            <YAxis
              stroke="#90caf9"
              tick={{ fill: "#ccc", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "#1e2a3a",
                border: "1px solid #42a5f5",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend
              wrapperStyle={{ color: "#ccc", fontSize: "13px" }}
            />
            <Line
              type="monotone"
              dataKey="arrivals"
              name="Arrivals"
              stroke="#43a047"
              strokeWidth={2}
              dot={{ fill: "#43a047", r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="departures"
              name="Departures"
              stroke="#fb8c00"
              strokeWidth={2}
              dot={{ fill: "#fb8c00", r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default PortCharts;