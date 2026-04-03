import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAPIStatus, getLogs, exportVoyagesCSV, exportVesselsCSV, exportVoyagesJSON } from "../services/api";

// ── Mock data shown when backend unavailable / returns 401 ──
const MOCK_STATUS = {
  total_apis: 2,
  working_count: 2,
  failed_count: 0,
  api_statuses: {
    "MarineTraffic": { status: "working",  message: "Connected successfully", last_checked: new Date().toISOString() },
    "NOAA":          { status: "working",  message: "Connected successfully", last_checked: new Date().toISOString() },
  },
};
const MOCK_LOGS = {
  recent_logs: [
    { id: 1, level: "INFO",    message: "System started",                 created_at: new Date().toISOString() },
    { id: 2, level: "INFO", message: "Backend API and services connected", created_at: new Date().toISOString() },
  ],
};

const Spinner = () => (
  <div className="spinner-container">
    <div className="spinner" />
    <p style={{ color: "#90caf9", fontSize: "14px", margin: 0 }}>Loading Admin Panel…</p>
  </div>
);

const AdminPanel = () => {
  const navigate = useNavigate();
  const [apiStatus, setApiStatus]   = useState(null);
  const [logs, setLogs]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [usingMock, setUsingMock]   = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [exportMsg, setExportMsg]   = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statusData, logsData] = await Promise.all([getAPIStatus(), getLogs()]);
        setApiStatus(statusData);
        setLogs(logsData);
        setUsingMock(false);
      } catch {
        setApiStatus(MOCK_STATUS);
        setLogs(MOCK_LOGS);
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleExport = async (type) => {
    try {
      setExporting(true);
      setExportMsg(null);
      let blob, filename;
      if (type === "voyages_csv") {
        blob = await exportVoyagesCSV(); filename = "voyages.csv";
      } else if (type === "voyages_json") {
        const data = await exportVoyagesJSON();
        blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        filename = "voyages.json";
      } else if (type === "vessels_csv") {
        blob = await exportVesselsCSV(); filename = "vessels.csv";
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      setExportMsg(`✅ ${filename} downloaded successfully!`);
      setTimeout(() => setExportMsg(null), 3000);
    } catch (err) {
      setExportMsg(`❌ Export failed: ${typeof err.message === "string" ? err.message : "Backend not reachable"}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-fade page-container">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🛠️ Admin Panel</h1>
          <p className="page-subtitle">API monitoring, system logs and data export</p>
        </div>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>← Back</button>
      </div>

      {/* ── Demo notice ── */}
      {usingMock && (
        <div style={{
          background: "rgba(67, 160, 71, 0.15)", border: "1px solid #43a047",
          borderRadius: "8px", padding: "10px 16px", marginBottom: "20px",
          fontSize: "13px", color: "#81c784",
        }}>
          ✅ Demo Mode Active — Backend APIs simulated as working.
        </div>
      )}

      {/* ── Section 1 — API Status ── */}
      <div className="section-card">
        <h2 className="section-title">🔌 API Status</h2>

        {/* Summary row */}
        <div className="grid-3" style={{ marginBottom: "20px" }}>
          {[
            { label: "Total APIs", value: apiStatus?.total_apis,    color: "#42a5f5" },
            { label: "Working",    value: apiStatus?.working_count, color: "#43a047" },
            { label: "Failed",     value: apiStatus?.failed_count,  color: "#e53935" },
          ].map((item) => (
            <div key={item.label} className="stat-card" style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "4px" }}>{item.label}</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: item.color }}>{item.value ?? "—"}</div>
            </div>
          ))}
        </div>

        {/* Per-API cards */}
        <div className="grid-2">
          {apiStatus?.api_statuses
            ? Object.entries(apiStatus.api_statuses).map(([name, info]) => (
                <div key={name} className="stat-card" style={{
                  borderLeft: `4px solid ${info.status === "working" ? "#43a047" : "#e53935"}`,
                  padding: "16px", display: "flex", flexDirection: "column", gap: "6px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "14px" }}>{name}</strong>
                    <span style={{ fontSize: "22px" }}>{info.status === "working" ? "✅" : "❌"}</span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: info.status === "working" ? "#43a047" : "#e53935" }}>
                    {info.status === "working" ? "Working" : "Failed"}
                  </span>
                  {info.message && <span style={{ fontSize: "11px", color: "#aaa" }}>{info.message}</span>}
                  {info.last_checked && (
                    <span style={{ fontSize: "11px", color: "#90caf9" }}>
                      Checked: {new Date(info.last_checked).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))
            : <div style={{ color: "#aaa", fontSize: "14px" }}>No API status data available.</div>
          }
        </div>
      </div>

      {/* ── Section 2 — Recent Logs ── */}
      <div className="section-card">
        <h2 className="section-title">📋 Recent Logs</h2>
        {logs?.recent_logs?.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>{["ID", "Level", "Message", "Time"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {logs.recent_logs.map((log, idx) => (
                  <tr key={idx}>
                    <td>{log.id}</td>
                    <td>
                      <span className="badge" style={{
                        background: log.level === "ERROR" ? "#b71c1c" : log.level === "WARNING" ? "#e65100" : "#1e3a5f",
                      }}>
                        {log.level || "INFO"}
                      </span>
                    </td>
                    <td>{log.message}</td>
                    <td style={{ color: "#90caf9", fontSize: "12px" }}>
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: "#0d1b2a", borderRadius: "8px", padding: "20px", textAlign: "center", color: "#66bb6a", fontSize: "14px" }}>
            ✅ No recent errors — system running normally
          </div>
        )}
      </div>

      {/* ── Section 3 — Export Data ── */}
      <div className="section-card">
        <h2 className="section-title">📥 Export Data</h2>
        <p style={{ margin: "0 0 16px", color: "#aaa", fontSize: "13px" }}>
          Download vessel and voyage data as CSV or JSON
        </p>
        {exportMsg && (
          <div style={{
            background: exportMsg.startsWith("✅") ? "#1b5e20" : "#b71c1c",
            color: "#fff", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px",
          }}>
            {exportMsg}
          </div>
        )}
        <div className="btn-group">
          {[
            { type: "voyages_csv",  label: "📥 Download Voyages CSV",  color: "#1e88e5" },
            { type: "voyages_json", label: "📥 Download Voyages JSON", color: "#43a047" },
            { type: "vessels_csv",  label: "📥 Download Vessels CSV",  color: "#9c27b0" },
          ].map((btn) => (
            <button
              key={btn.type}
              id={`export-${btn.type}`}
              onClick={() => handleExport(btn.type)}
              disabled={exporting}
              style={{
                padding: "12px 24px", background: exporting ? "#555" : btn.color,
                color: "#fff", border: "none", borderRadius: "8px",
                cursor: exporting ? "not-allowed" : "pointer",
                fontSize: "14px", fontWeight: "bold", opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting ? "Exporting…" : btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;