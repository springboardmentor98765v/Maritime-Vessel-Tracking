import { useEffect, useState } from "react";
import { getCompanyDashboard, getPortDashboard } from "../api/axios";

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [company, setCompany] = useState(null);
  const [port, setPort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [cRes, pRes] = await Promise.all([
        getCompanyDashboard(),
        getPortDashboard(),
      ]);

      setCompany(cRes.data);
      console.log("Company API Response:", cRes.data);
      setPort(pRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  if (loading) return <p style={{ padding: 20 }}>⏳ Loading Dashboard...</p>;

if (error)
  return (
    <div style={{ padding: 20 }}>
      <p>❌ {error}</p>
    </div>
  );

  const chartData = [
  { name: "Mon", value: port.arrivals * 0.8 },
  { name: "Tue", value: port.arrivals * 1.1 },
  { name: "Wed", value: port.arrivals * 0.9 },
  { name: "Thu", value: port.arrivals * 1.3 },
  { name: "Fri", value: port.arrivals },
];

  return (
    <div className="premium-dashboard">

      {/* HEADER */}
      <div className="dash-header">
        <h1>⚓ Real-time maritime operations overview</h1>
        <p></p>
      </div>

      {/* COMPANY */}
      <section>
        <h2 className="section-title">Company Overview</h2>
        <div className="card-grid">
          <Card title="Active Vessels" value={company.active_vessels} icon="🚢" />
          <Card title="Delayed Routes" value={company.delayed_vessels} icon="⏱" />
          <Card title="Risk Alerts" value={company.risk_alerts} icon="⚠" danger />
        </div>
      </section>

      {/* PORT */}
      <section>
        <h2 className="section-title">Port Performance</h2>
        <div className="card-grid">
          <Card title="Congestion" value={port.congestion_score} icon="📊" />
          <Card title="Arrivals" value={port.arrivals} icon="🛬" />
          <Card title="Departures" value={port.departures} icon="🛫" />
          <Card title="Avg Wait" value={port.avg_wait_time + "h"} icon="⏳" />
        </div>
      </section>

      {/* CHART */}
      <section className="chart-container">
        <h3 className="chart-title">Traffic Distribution</h3>

        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={chartData}
            margin={{ top: 30, right: 30, left: 0, bottom: 5 }}
          >
            
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="name"
              tick={{ fill: "#475569" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#475569" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: "rgba(59,130,246,0.1)" }}
              contentStyle={{
                background: "#0f172a",
                borderRadius: "12px",
                border: "none",
                color: "#fff",
              }}
            />

            

            <defs>
  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
  </linearGradient>
</defs>

<Area
  type="monotone"
  dataKey="value"
  stroke="#3b82f6"
  strokeWidth={3}
  fill="url(#colorFlow)"
  activeDot={{ r: 6 }}
/>

          </ComposedChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

/* CARD */
function Card({ title, value, icon, danger }) {
  return (
    <div className={`premium-card ${danger ? "danger" : ""}`}>
      <div className="card-top">
        <span className="icon">{icon}</span>
        <p>{title}</p>
      </div>
      <h2>{value ?? 0}</h2>
    </div>
  );
}