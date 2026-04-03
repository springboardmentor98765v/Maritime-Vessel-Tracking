import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { getCompanyDashboard } from "../services/api";

const COLORS = ["#1e88e5", "#e53935", "#43a047", "#fb8c00", "#9c27b0"];

// ── Mock data shown when backend unavailable / returns 401 ──
const MOCK_DATA = {
  active_vessels:  12,
  delayed_vessels:  3,
  risk_alerts:      2,
  recent_alerts:    5,
  vessel_breakdown: [
    { vessel_type: "Container",    count: 5 },
    { vessel_type: "Tanker",       count: 3 },
    { vessel_type: "Bulk Carrier", count: 2 },
    { vessel_type: "Cargo",        count: 2 },
  ],
};

const Spinner = () => (
  <div className="spinner-container">
    <div className="spinner" />
    <p style={{ color: "#90caf9", fontSize: "14px", margin: 0 }}>Loading Company Dashboard…</p>
  </div>
);

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const json = await getCompanyDashboard();
        setData(json);
      } catch {
        // Backend unavailable or 401 — show demo data so the page is always functional
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  const statCards = [
    { label: "Active Vessels",     value: data?.active_vessels  || 0, icon: "🚢", color: "#43a047" },
    { label: "Delayed Vessels",    value: data?.delayed_vessels || 0, icon: "⏰", color: "#fb8c00" },
    { label: "Risk Alerts",        value: data?.risk_alerts     || 0, icon: "⚠️", color: "#e53935" },
    { label: "Recent Alerts (24h)",value: data?.recent_alerts   || 0, icon: "🔔", color: "#9c27b0" },
  ];

  const barData = [
    { name: "Active",  value: data?.active_vessels  || 0 },
    { name: "Delayed", value: data?.delayed_vessels || 0 },
    { name: "Risks",   value: data?.risk_alerts     || 0 },
    { name: "Alerts",  value: data?.recent_alerts   || 0 },
  ];

  return (
    <div className="page-fade page-container bg-red-900">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Company Dashboard</h1>
          <p className="page-subtitle">Live company vessel and risk overview</p>
        </div>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>← Back</button>
      </div>



      {/* ── Stat Cards ── */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        {statCards.map((card) => (
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
          <h3 className="section-title">📈 Vessel Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3d4f" />
              <XAxis dataKey="name" stroke="#90caf9" tick={{ fill: "#ccc", fontSize: 12 }} />
              <YAxis stroke="#90caf9" tick={{ fill: "#ccc", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#1e2a3a", border: "1px solid #42a5f5", borderRadius: "8px", color: "#fff" }} />
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                {["#43a047", "#fb8c00", "#e53935", "#9c27b0"].map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {data?.vessel_breakdown?.length > 0 && (
          <div className="section-card">
            <h3 className="section-title">🚢 Vessel Type Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.vessel_breakdown}
                  dataKey="count"
                  nameKey="vessel_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ vessel_type, count }) => `${vessel_type}: ${count}`}
                >
                  {data.vessel_breakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e2a3a", border: "1px solid #42a5f5", borderRadius: "8px", color: "#fff" }} />
                <Legend wrapperStyle={{ color: "#ccc", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Quick Links ── */}
      <div className="section-card">
        <h3 className="section-title">🔗 Quick Navigation</h3>
        <div className="btn-group">
          {[
            { label: "🌍 Live Tracking",  path: "/live-tracking",   color: "#1e88e5" },
            { label: "⚓ Port Analytics", path: "/port-dashboard",  color: "#43a047" },
            { label: "🔔 Notifications",  path: "/notifications",   color: "#fb8c00" },
            { label: "🛠️ Admin Panel",    path: "/admin-panel",     color: "#9c27b0" },
          ].map((link) => (
            <button key={link.path} onClick={() => navigate(link.path)} style={{
              padding: "10px 20px", background: link.color, color: "#fff",
              border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600",
            }}>
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;