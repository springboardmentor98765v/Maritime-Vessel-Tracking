import { useEffect, useState } from "react"
import { Users, Ship, Anchor, Activity, Download } from "lucide-react"
import api from "../api/axios"

export default function AdminPage() {
  const [apiStatus, setApiStatus] = useState({})
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [statusResp, logsResp] = await Promise.all([
          api.get("/vessels/admin/api-status/"),
          api.get("/vessels/admin/logs/"),
        ])
        setApiStatus(statusResp.data || {})
        setLogs(logsResp.data || [])
      } catch (err) {
        console.error("Failed to load admin data", err?.response?.data || err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [])

  const handleExport = async () => {
    try {
      const response = await api.get("/vessels/admin/export/voyages/?format=json")
      const data = response.data || []

      const headers = ["id", "vessel", "start_port", "end_port", "start_time", "end_time", "status"]
      const csvRows = []
      
      // Add header row
      csvRows.push(headers.join(","))
      
      // Add data rows if they exist
      if (data.length > 0) {
        data.forEach(row => {
          const values = headers.map(header => {
            let val = row[header]
            if (val === null || val === undefined) val = ""
            val = String(val).replace(/"/g, '""')
            if (val.includes(",")) val = `"${val}"`
            return val
          })
          csvRows.push(values.join(","))
        })
      }

      const csvString = csvRows.join("\n")
      const blobUrl = URL.createObjectURL(new Blob([csvString], { type: "text/csv;charset=utf-8;" }))
      const link = document.createElement("a")
      link.href = blobUrl
      link.setAttribute("download", "voyages_export.csv")
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error("Export failed", err?.response?.data || err.message)
      alert("Failed to export data: " + (err?.response?.data?.detail || err.message))
    }
  }

  return (
    <div className="page-shell">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Admin Panel</h1>
        <button
          onClick={handleExport}
          className="pill hover:bg-emerald-900/60 transition"
        >
          <Download size={14} />
          Download Data
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <p className="stat-label">API Sources</p>
              <p className="stat-kpi">{Object.keys(apiStatus).length}</p>
            </div>
            <Users className="text-emerald-200" size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <p className="stat-label">Log Entries</p>
              <p className="stat-kpi">{logs.length}</p>
            </div>
            <Ship className="text-emerald-200" size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <p className="stat-label">System State</p>
              <p className="stat-kpi">{loading ? "Loading" : "Ready"}</p>
            </div>
            <Anchor className="text-emerald-200" size={22} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold text-emerald-50 mb-3">API Status</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {Object.entries(apiStatus).map(([name, state]) => (
              <div key={name} className="rounded-xl border border-emerald-900/70 bg-emerald-950/60 p-3">
                <div className="text-sm text-emerald-200/80">{name}</div>
                <div className={`text-sm font-semibold ${state === "working" ? "text-emerald-300" : "text-red-300"}`}>
                  {state}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="flex items-center mb-4">
            <Activity className="mr-2 text-emerald-300" />
            <h2 className="text-lg font-semibold text-emerald-50">Recent Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-emerald-900/60 text-xs uppercase tracking-wide text-emerald-200/80">
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2 pr-3">Message</th>
                  <th className="py-2 pr-3">Level</th>
                  <th className="py-2 pr-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={`${log.timestamp}-${idx}`} className="border-b border-emerald-950/60">
                    <td className="py-2 pr-3 text-emerald-100/90">{log.source}</td>
                    <td className="py-2 pr-3 text-emerald-100/90">{log.message}</td>
                    <td className="py-2 pr-3 text-emerald-200/80">{log.level}</td>
                    <td className="py-2 pr-3 text-emerald-200/70 text-xs">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
