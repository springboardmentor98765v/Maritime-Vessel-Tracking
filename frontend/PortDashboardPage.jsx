import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getPortDashboard } from "../services/api";

const getCongestionColor = (score) => {
  if (score >= 0.4)  return "#e53935";
  if (score >= 0.25) return "#fb8c00";
  return "#43a047";
};
const getCongestionLabel = (score) => {
  if (score >= 0.4)  return "High";
  if (score >= 0.25) return "Medium";
  return "Low";
};

// ── Mock data shown when backend unavailable / returns 401 ──
const MOCK_DATA = {
  summary: { total_ports: 4, total_arrivals: 480, total_departures: 450, avg_congestion: 0.31 },
  ports: [
    { port: "Singapore", arrivals: 120, departures: 115, congestion_score: 0.35, avg_wait_time: 4.2 },
    { port: "Rotterdam",  arrivals:  98, departures:  95, congestion_score: 0.22, avg_wait_time: 3.1 },
    { port: "Dubai",      arrivals: 110, departures:  98, congestion_score: 0.41, avg_wait_time: 6.5 },
    { port: "Mumbai",     arrivals: 152, departures: 142, congestion_score: 0.28, avg_wait_time: 5.0 },
  ],
};

const Spinner = () => (
  <div className="spinner-container">
    <div className="spinner" />
    <p style={{ color: "#90caf9", fontSize: "14px", margin: 0 }}>Loading Port Dashboard…</p>
  </div>
);

const PortDashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const json = await getPortDashboard();
        setData(json);
      } catch {
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  const ports   = data?.ports   || [];
  const summary = data?.summary || {};

  return (
    <div className="page-fade page-container">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">⚓ Port Dashboard</h1>
          <p className="page-subtitle">Live port congestion and traffic overview</p>
        </div>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>← Back</button>
      </div>



      {/* ── Summary Cards ── */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        {[
          { label: "Total Ports",      value: summary.total_ports      || 0, icon: "🏭", color: "#1e88e5" },
          { label: "Total Arrivals",   value: summary.total_arrivals   || 0, icon: "🚢", color: "#43a047" },
          { label: "Total Departures", value: summary.total_departures || 0, icon: "🛳️", color: "#fb8c00" },
          {
            label: "Avg Congestion",
            value: typeof summary.avg_congestion === "number" ? summary.avg_congestion.toFixed(2) : "0.00",
            icon: "📊",
            color: getCongestionColor(summary.avg_congestion || 0),
          },
        ].map((card) => (
          <div key={card.label} className="stat-card card-hover" style={{ borderLeft: `4px solid ${card.color}` }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{card.icon}</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: card.color }}>{card.value}</div>
            <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid-2" style={{ marginBottom: "24px" }}>
        <div className="section-card">
          <h3 className="section-title">📈 Arrivals vs Departures</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ports} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3d4f" />
              <XAxis dataKey="port" stroke="#90caf9" tick={{ fill: "#ccc", fontSize: 11 }} />
              <YAxis stroke="#90caf9" tick={{ fill: "#ccc", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1e2a3a", border: "1px solid #42a5f5", borderRadius: "8px", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#ccc", fontSize: "12px" }} />
              <Bar dataKey="arrivals"   name="Arrivals"   fill="#43a047" radius={[4, 4, 0, 0]} />
              <Bar dataKey="departures" name="Departures" fill="#fb8c00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card">
          <h3 className="section-title">🌡️ Congestion Score by Port</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ports} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3d4f" />
              <XAxis dataKey="port" stroke="#90caf9" tick={{ fill: "#ccc", fontSize: 11 }} />
              <YAxis stroke="#90caf9" tick={{ fill: "#ccc", fontSize: 11 }} domain={[0, 1]} />
              <Tooltip
                contentStyle={{ background: "#1e2a3a", border: "1px solid #e53935", borderRadius: "8px", color: "#fff" }}
                formatter={(v) => [v.toFixed(2), "Congestion Score"]}
              />
              <Bar dataKey="congestion_score" name="Congestion" fill="#e53935" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Port Cards ── */}
      <h2 className="section-title" style={{ marginBottom: "16px" }}>🏭 Port Details</h2>
      <div className="grid-3">
        {ports.map((port, idx) => (
          <div key={idx} className="stat-card card-hover" style={{ borderLeft: `4px solid ${getCongestionColor(port.congestion_score)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>⚓ {port.port}</h3>
              <span className="badge" style={{ background: getCongestionColor(port.congestion_score) }}>
                {getCongestionLabel(port.congestion_score)}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              {[
                { label: "Arrivals",   value: port.arrivals,   color: "#43a047" },
                { label: "Departures", value: port.departures, color: "#fb8c00" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#0d1b2a", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#aaa" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: "#aaa" }}>Congestion</span>
                <span style={{ fontSize: "11px", fontWeight: "bold", color: getCongestionColor(port.congestion_score) }}>
                  {port.congestion_score?.toFixed(2)}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${(port.congestion_score || 0) * 100}%`,
                  background: getCongestionColor(port.congestion_score),
                }} />
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "#90caf9" }}>⏱ Avg Wait: {port.avg_wait_time || 0} hrs</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortDashboardPage;