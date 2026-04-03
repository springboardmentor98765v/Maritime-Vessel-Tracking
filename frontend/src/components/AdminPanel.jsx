import { useEffect, useState } from "react";
import {
  getApiStatus,
  getLogs,
  exportVoyages,
  exportEvents,
} from "../api/axios";

export default function AdminPanel() {
  const [status, setStatus] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusRes, logsRes] = await Promise.all([
        getApiStatus(),
        getLogs(),
      ]);

      setStatus(statusRes?.data || {});
      setLogs(logsRes?.data || []);
    } catch (err) {
      console.error("Admin API error:", err);
      setError("Failed to load admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleExport = async (type) => {
    try {
      setExporting(true);

      if (type === "voyages") {
        await exportVoyages();
      } else {
        await exportEvents();
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed. Try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">⏳ Loading Admin Panel...</div>;
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>❌ {error}</p>
        <button onClick={fetchAdminData}>🔄 Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>System health & data control</p>
      </div>

      <div className="admin-card">
        <h2>API Status</h2>

        <div className="status-grid">
          {["UNCTAD", "NOAA"].map((api) => {
            const apiStatus = status[api] || "failed";
            const isOk = apiStatus === "working";

            return (
              <div className="status-item" key={api}>
                <div className="status-name">{api}</div>

                <div className={`status-badge ${isOk ? "ok" : "fail"}`}>
                  {isOk ? "✅ Active" : "❌ Down"}
                </div>

                <div style={{ marginTop: "6px", fontSize: "13px" }}>
                  {apiStatus}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="admin-card">
        <h2>Recent Logs</h2>

        <div className="logs-table">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Message</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5">No recent logs</td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr
                    key={i}
                    className={log.status === "failed" ? "error-row" : ""}
                  >
                    <td>{log.source}</td>
                    <td>{log.endpoint}</td>
                    <td>
                      <span className={`log-status ${log.status}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{log.message}</td>
                    <td>
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <h2>Export Data</h2>

        <div className="export-actions">
          <button
            onClick={() => handleExport("voyages")}
            disabled={exporting}
          >
            ⬇ {exporting ? "Exporting..." : "Download Voyages"}
          </button>

          <button
            onClick={() => handleExport("events")}
            disabled={exporting}
          >
            ⬇ {exporting ? "Exporting..." : "Download Events"}
          </button>
        </div>
      </div>
    </div>
  );
}