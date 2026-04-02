import React, { useEffect, useState } from "react"
import api from "../api/axios"
import { Clock3, Ship } from "lucide-react"

export default function VoyageHistoryPage() {

  const [voyages, setVoyages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        const resp = await api.get("/voyages/")
        setVoyages(resp.data || [])
      } catch (err) {
        console.error("Failed to load voyages", err?.response?.data || err.message)
        setError("Failed to load voyage history")
      } finally {
        setLoading(false)
      }
    }

    fetchVoyages()
  }, [])

  const statusClasses = (status) => {
    if (status === "COMPLETED") {
      return "bg-emerald-900/60 text-emerald-200 border border-emerald-700/60"
    }
    return "bg-amber-900/60 text-amber-200 border border-amber-700/60"
  }

  return (

    <div className="page-shell">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Voyage history</h1>
          <p className="page-subtitle">
            Completed and ongoing voyages from the tracking engine.
          </p>
        </div>
        <span className="pill">
          <Clock3 size={14} />
          {voyages.length} voyages
        </span>
      </div>

      <div className="card">
        <div className="card-body">
          {loading && (
            <div className="text-sm text-emerald-100/80">
              Loading voyage history…
            </div>
          )}
          {error && !loading && (
            <div className="text-sm text-red-400">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b border-emerald-900/60 text-xs uppercase tracking-wide text-emerald-200/80">
                    <th className="py-3 pr-4">Vessel</th>
                    <th className="py-3 pr-4">Origin</th>
                    <th className="py-3 pr-4">Destination</th>
                    <th className="py-3 pr-4">Start time</th>
                    <th className="py-3 pr-4">End time</th>
                    <th className="py-3 pr-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {voyages.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-emerald-950/60 hover:bg-emerald-950/70 transition"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700/70 text-emerald-50">
                            <Ship size={12} />
                          </span>
                          <span className="font-medium text-emerald-50">
                            {v.vessel}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-emerald-100/90">
                        {v.start_port}
                      </td>
                      <td className="py-3 pr-4 text-sm text-emerald-100/90">
                        {v.end_port}
                      </td>
                      <td className="py-3 pr-4 text-sm text-emerald-100/80">
                        {v.start_time}
                      </td>
                      <td className="py-3 pr-4 text-sm text-emerald-100/80">
                        {v.end_time || "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${statusClasses(v.status)}`}
                        >
                          {v.status === "COMPLETED" ? "Completed" : "Ongoing"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}
        </div>
      </div>

    </div>

  )

}
