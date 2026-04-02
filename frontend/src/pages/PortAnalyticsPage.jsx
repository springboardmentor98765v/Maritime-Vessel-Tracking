import React, { useEffect, useState } from "react";
import ArrivalsDepartures from "../components/ports/ArrivalsDepartures";
import CongestionChart from "../components/ports/CongestionChart";
import { BarChart3 } from "lucide-react";
import api from "../api/axios";

export default function PortAnalyticsPage() {
  const [portDash, setPortDash] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPortDash = async () => {
      try {
        const resp = await api.get("/vessels/dashboard/port/")
        setPortDash(resp.data || null)
      } catch (err) {
        console.error(
          "Failed to load port dashboard",
          err?.response?.data || err.message
        )
        setError("Failed to load port analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchPortDash()
  }, [])

  const weeklyData = (portDash?.ports || []).map((p) => ({
    date: p.port,
    arrivals: p.arrivals,
    departures: p.departures,
  }))

  const congestionData = (portDash?.ports || []).map((p) => ({
    port: p.port,
    congestionScore: p.congestionScore,
  }))

  return (
    <div className="page-shell">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Port analytics</h1>
          <p className="page-subtitle">
            Congestion overview with arrivals, departures, and risk indicators.
          </p>
        </div>
        <span className="pill border-slate-200 text-slate-700 bg-white">
          <BarChart3 size={14} />
          Analytics
        </span>
      </div>

      {loading ? (
        <div className="text-sm text-emerald-100/80">Loading port analytics…</div>
      ) : error ? (
        <div className="text-sm text-red-400">{error}</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="stat-card">
              <div className="stat-card-inner">
                <div>
                  <div className="stat-label">Congestion score</div>
                  <div className="stat-kpi">{portDash?.congestion_score ?? 0}</div>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
                  <BarChart3 size={18} />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-inner">
                <div>
                  <div className="stat-label">Arrivals</div>
                  <div className="stat-kpi">{portDash?.arrivals ?? 0}</div>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
                  <BarChart3 size={18} />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-inner">
                <div>
                  <div className="stat-label">Departures</div>
                  <div className="stat-kpi">{portDash?.departures ?? 0}</div>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
                  <BarChart3 size={18} />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-inner">
                <div>
                  <div className="stat-label">Avg wait time (min)</div>
                  <div className="stat-kpi">{portDash?.avg_wait_time ?? 0}</div>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
                  <BarChart3 size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-body">
                <ArrivalsDepartures data={weeklyData} />
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <CongestionChart data={congestionData} />
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
