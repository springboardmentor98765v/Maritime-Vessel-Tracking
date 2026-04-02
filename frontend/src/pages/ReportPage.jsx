import React, { useMemo, useState } from "react"
import {
  FileText,
  Download,
  Calendar,
  Ship
} from "lucide-react"

export default function ReportPage() {

  // Dummy report data (Milestone-1)
  const [reports] = useState([
    {
      id: 1,
      name: "Daily Vessel Report",
      type: "Daily",
      date: "2026-02-16",
      vessels: 128,
      status: "Generated"
    },
    {
      id: 2,
      name: "Port Traffic Report",
      type: "Weekly",
      date: "2026-02-14",
      vessels: 342,
      status: "Generated"
    },
    {
      id: 3,
      name: "Voyage History Report",
      type: "Monthly",
      date: "2026-02-01",
      vessels: 892,
      status: "Pending"
    }
  ])

  const handleDownload = (reportName) => {
    alert(`Downloading ${reportName}...`)
  }

  const totals = useMemo(() => {
    const generated = reports.filter((r) => r.status === "Generated").length
    const pending = reports.filter((r) => r.status === "Pending").length
    return { total: reports.length, generated, pending }
  }, [reports])

  const statusClasses = (status) => {
    if (status === "Generated") {
      return "bg-emerald-900/60 text-emerald-200 border border-emerald-700/60"
    }
    return "bg-amber-900/60 text-amber-200 border border-amber-700/60"
  }

  return (
    <div className="page-shell">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">
            Exportable snapshots for vessel traffic, ports, and voyage history.
          </p>
        </div>
        <span className="pill">
          <FileText size={14} />
          {totals.total} reports
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <div className="stat-label">Total reports</div>
              <div className="stat-kpi">{totals.total}</div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
              <FileText size={18} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <div className="stat-label">Generated</div>
              <div className="stat-kpi">{totals.generated}</div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
              <Download size={18} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <div className="stat-label">Pending</div>
              <div className="stat-kpi">{totals.pending}</div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-900/60 text-amber-100 flex items-center justify-center border border-amber-700/70">
              <Calendar size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="card">
        <div className="card-body">

          <h2 className="text-lg font-semibold mb-4 text-emerald-50">
            Available reports
          </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b border-emerald-900/60 text-xs uppercase tracking-wide text-emerald-200/80">
                <th className="py-3 pr-4">Report name</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Vessels</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>

              {reports.map(report => (

                <tr
                  key={report.id}
                  className="border-b border-emerald-950/60 hover:bg-emerald-950/70 transition"
                >

                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700/70 text-emerald-50">
                        <Ship size={12} />
                      </span>
                      <span className="font-medium text-emerald-50">
                        {report.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 pr-4 text-sm text-emerald-100/90">
                    {report.type}
                  </td>

                  <td className="py-3 pr-4 text-sm text-emerald-100/90">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-emerald-200/80" />
                      {report.date}
                    </div>
                  </td>

                  <td className="py-3 pr-4 text-sm text-emerald-100/90">
                    {report.vessels}
                  </td>

                  <td className="py-3 pr-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${statusClasses(report.status)}`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td className="py-3 pr-4 text-right">

                    <button
                      onClick={() =>
                        handleDownload(report.name)
                      }
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-800/70 bg-emerald-950/70 text-emerald-100 hover:bg-emerald-950 transition"
                    >
                      <Download size={16} />
                      Download
                    </button>

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
