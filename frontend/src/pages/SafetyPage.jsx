import React from "react"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Ship,
  Activity
} from "lucide-react"

export default function SafetyPage() {

  // Dummy safety data (replace later with API)
  const safetyStats = [
    {
      title: "Total Vessels Monitored",
      value: "128",
      icon: Ship,
      color: "bg-blue-500"
    },
    {
      title: "Active Alerts",
      value: "6",
      icon: AlertTriangle,
      color: "bg-red-500"
    },
    {
      title: "Safe Vessels",
      value: "110",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      title: "Risk Level",
      value: "Moderate",
      icon: Shield,
      color: "bg-yellow-500"
    }
  ]

  const alerts = [
    {
      id: 1,
      vessel: "MV Ocean Star",
      type: "Speed Violation",
      location: "Chennai Port",
      severity: "High",
      time: "10 min ago"
    },
    {
      id: 2,
      vessel: "MT Blue Whale",
      type: "Restricted Area Entry",
      location: "Mumbai Port",
      severity: "Medium",
      time: "25 min ago"
    },
    {
      id: 3,
      vessel: "MV Sea Explorer",
      type: "Signal Lost",
      location: "Kolkata Port",
      severity: "Low",
      time: "1 hr ago"
    }
  ]

  const getSeverityColor = (severity) => {
    if (severity === "High") return "bg-red-900/60 text-red-100 border border-red-700/70"
    if (severity === "Medium") return "bg-amber-900/60 text-amber-100 border border-amber-700/70"
    return "bg-emerald-900/60 text-emerald-100 border border-emerald-700/70"
  }

  return (
    <div className="page-shell">

      {/* Page Header */}
      <div>
        <h1 className="page-title">Safety monitoring</h1>
        <p className="page-subtitle">Risk zones, alerts, and compliance signals.</p>
      </div>

      {/* Safety Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {safetyStats.map((stat, index) => {
          const Icon = stat.icon

          return (
            <div
              key={index}
              className="stat-card"
            >
              <div className="stat-card-inner">
                <div>
                  <p className="stat-label">{stat.title}</p>
                  <h2 className="stat-kpi mt-1">{stat.value}</h2>
                </div>

                <div className={`${stat.color} p-3 rounded-xl shadow-sm`}>
                  <Icon className="text-white" size={22} />
                </div>
              </div>
            </div>
          )
        })}

      </div>

      {/* Alerts Table */}
      <div className="card">
        <div className="card-body">

          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-50">
            <Activity size={18} />
            Recent safety alerts
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-emerald-900/60 text-xs uppercase tracking-wide text-emerald-200/80">
                  <th className="py-3 pr-4">Vessel</th>
                  <th className="py-3 pr-4">Alert type</th>
                  <th className="py-3 pr-4">Location</th>
                  <th className="py-3 pr-4">Severity</th>
                  <th className="py-3 pr-4">Time</th>
                </tr>
              </thead>

              <tbody>

                {alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b border-emerald-950/60 hover:bg-emerald-950/70 transition"
                  >

                    <td className="py-3 pr-4 font-medium text-emerald-50">
                      {alert.vessel}
                    </td>

                    <td className="py-3 pr-4 text-sm text-emerald-100/90">
                      {alert.type}
                    </td>

                    <td className="py-3 pr-4 text-sm text-emerald-100/90">
                      {alert.location}
                    </td>

                    <td className="py-3 pr-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getSeverityColor(alert.severity)}`}
                      >
                        {alert.severity}
                      </span>
                    </td>

                    <td className="py-3 pr-4 text-emerald-200/80 text-sm">
                      {alert.time}
                    </td>

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
