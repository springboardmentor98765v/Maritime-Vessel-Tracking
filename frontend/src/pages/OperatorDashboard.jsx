import { useEffect, useState } from "react";
import { getVessels, getNotifications, getCompanyDashboard } from "../api/axios";
import API from "../api/axios";

export default function OperatorDashboard() {

  const [vessels, setVessels] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subscribed, setSubscribed] = useState([]);

  const [stats, setStats] = useState({
    active: 0,
    atPort: 0,
    delayed: 0,
    alerts: 0,
    avgSpeed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [vesselsRes, notificationsRes, subsRes, companyRes] = await Promise.all([
          getVessels(),
          getNotifications(),
          API.get("/api/notifications/subscriptions/"),
          getCompanyDashboard(),
        ]);

        const vesselsData = vesselsRes.data?.results || vesselsRes.data || [];
        const notificationsData = notificationsRes.data?.results || notificationsRes.data || [];
        const subscriptions = subsRes.data || [];
        const companyData = companyRes.data || {};

        setVessels(vesselsData);
        setNotifications(notificationsData);
        setSubscribed(subscriptions);

        // KPI calculations
        const activeShips = vesselsData.filter(
          v => Number(v.speed || 0) > 0
        ).length;

        const atPortShips = vesselsData.filter(
          v => Number(v.speed || 0) === 0
        ).length;

        const avgSpeed =
          vesselsData.reduce((sum, v) => sum + Number(v.speed || 0), 0) /
          (vesselsData.length || 1);

        setStats({
          active: activeShips,
          atPort: atPortShips,
          delayed: companyData.delayed_vessels || 0,
          alerts: companyData.risk_alerts || 0,
          avgSpeed: avgSpeed.toFixed(1),
        });

      } catch (err) {
        console.error("Operator dashboard error:", err);
        setError("Failed to load operator dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading dashboard...</p>;
  if (error) return <p style={{ padding: 20 }}>{error}</p>;

  const subscribedVessels = vessels.filter(v =>
    subscribed.some(s => s.vessel === v.id)
  );

  return (
    <div className="premium-dashboard">

      <h1 className="dash-header">🚢 Fleet Operations Overview</h1>

      <div className="card-grid">
        <Card title="Active Vessels" value={stats.active} icon="🟢" />
        <Card title="Delayed Routes" value={stats.delayed} icon="⏱" danger />
        <Card title="Risk Alerts" value={stats.alerts} icon="🚨" danger />
        <Card title="Avg Speed" value={stats.avgSpeed + " kn"} icon="💨" />
      </div>

      <div className="table-section">

        <h3 className="section-title">📡 Subscribed Vessels</h3>

        <table className="vessel-table">

          <thead>
            <tr>
              <th>IMO</th>
              <th>Name</th>
              <th>Type</th>
              <th>Flag</th>
              <th>Destination</th>
              <th>Speed</th>
            </tr>
          </thead>

          <tbody>
            {subscribedVessels.length === 0 ? (
              <tr>
                <td colSpan="6">No subscribed vessels yet
                  <br />
                  Click the subscribe button on the vessel page to subscribe vessels</td>
              </tr>
            ) : (
              subscribedVessels.map(v => (
                <tr key={v.id}>
                  <td>{v.imo_number}</td>
                  <td>{v.name}</td>
                  <td>{v.vessel_type}</td>
                  <td>{v.flag}</td>
                  <td>{v.destination}</td>
                  <td>{v.speed}</td>
                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

    </div>
  );
}

function Card({ title, value, icon, danger }) {
  return (
    <div className={`premium-card ${danger ? "danger" : ""}`}>
      <div className="card-top">
        <span className="icon">{icon}</span>
        <p>{title}</p>
      </div>
      <h2>{value}</h2>
    </div>
  );
}