import { useEffect, useState } from "react";
import { getPorts, getPortDashboard } from "../api/axios";

export default function AnalystDashboard() {
  const [ports, setPorts] = useState([]);
  const [summary, setSummary] = useState({
    total_ports: 0,
    congestion_score: 0,
    arrivals: 0,
    departures: 0,
    avg_wait_time: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [portsRes, summaryRes] = await Promise.all([
          getPorts(),
          getPortDashboard(),
        ]);

        const portsData = portsRes.data?.results || portsRes.data || [];
        const summaryData = summaryRes.data || {};

        setPorts(Array.isArray(portsData) ? portsData : []);
        setSummary({
          total_ports: summaryData.total_ports ?? 0,
          congestion_score: summaryData.congestion_score ?? 0,
          arrivals: summaryData.arrivals ?? 0,
          departures: summaryData.departures ?? 0,
          avg_wait_time: summaryData.avg_wait_time ?? 0,
        });
      } catch (err) {
        console.error("Analyst dashboard error:", err);
        setError("Failed to load analyst dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (error) return <p style={{ padding: 20 }}>{error}</p>;

  const highRiskPorts = ports.filter(
    (p) => Number(p.congestion_score || 0) > 70
  ).length;

  const topPorts = [...ports]
    .sort((a, b) => Number(b.congestion_score || 0) - Number(a.congestion_score || 0))
    .slice(0, 6);

  return (
    <div className="premium-dashboard">
      <div className="dash-header">
        <h1>📊 Trends, insights & performance</h1>
      </div>

      {/* KPI CARDS (UNCHANGED) */}
      <div className="card-grid">
        <Card title="Total Ports" value={summary.total_ports} icon="⚓" />
        <Card title="Avg Congestion" value={summary.congestion_score} icon="📈" />
        <Card title="Avg Wait (hrs)" value={summary.avg_wait_time} icon="⏱" />
        <Card title="High Risk Ports" value={highRiskPorts} icon="⚠" danger />
      </div>

      {/* ✅ UPDATED TABLE UI (same styling as operator) */}
      <div className="table-section">
        <h3 className="section-title">📊 Port Congestion Comparison</h3>

        <table className="vessel-table">
          <thead>
            <tr>
              <th>Port</th>
              <th>Congestion</th>
              <th>Arrivals</th>
              <th>Departures</th>
              <th>Avg Wait</th>
            </tr>
          </thead>

          <tbody>
            {topPorts.length === 0 ? (
              <tr>
                <td colSpan="5">No port data available</td>
              </tr>
            ) : (
              topPorts.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{Number(p.congestion_score).toFixed(2)}</td>
                  <td>{p.arrivals}</td>
                  <td>{p.departures}</td>
                  <td>{Number(p.avg_wait_time).toFixed(2)}h</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* INSIGHTS (UNCHANGED) */}
      <section className="dashboard-section">
        <h3>Key Insights</h3>

        <ul>
          <li>⚓ Total monitored ports: {summary.total_ports}</li>
          <li>📈 Average congestion score: {summary.congestion_score}</li>
          <li>🚢 Total arrivals: {summary.arrivals}</li>
          <li>🛫 Total departures: {summary.departures}</li>
          <li>⏱ Average wait time: {summary.avg_wait_time} hours</li>
          <li>⚠ Ports with congestion above 70: {highRiskPorts}</li>
        </ul>
      </section>
    </div>
  );
}

// CARD COMPONENT (UNCHANGED)
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