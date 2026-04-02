import { useSelector } from "react-redux"
import VesselMap from "../components/maps/VesselMap"
import api from "../api/axios"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Activity, AlertTriangle, Expand, Ship, Users as UsersIcon, X, ArrowLeft } from "lucide-react"

export default function DashboardPage() {

  const user = useSelector((state) => state.auth?.user)
  const role = user?.role || "viewer"   // admin | operator | viewer
  const [mapFullscreen, setMapFullscreen] = useState(false)
  const [mapView, setMapView] = useState({ center: [20.5937, 78.9629], zoom: 5 })
  const [companyStats, setCompanyStats] = useState({
    total_vessels: 0,
    active_vessels: 0,
    delayed_vessels: 0,
    risk_alerts: 0,
    total_users: 0,
  })
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const selectedVesselId = state?.selectedVesselId || null

  
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const resp = await api.get("/vessels/dashboard/company/")
        setCompanyStats(resp.data || {})
      } catch (err) {
        console.error("Failed to load dashboard stats", err?.response?.data || err.message)
      }
    }

    loadDashboardStats()
    const interval = setInterval(loadDashboardStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="page-shell">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back,{" "}
            <span className="font-medium text-emerald-100">
              {user?.username || user?.name || "Maritime User"}
            </span>{" "}
            • <span className="capitalize">{role}</span>
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="pill">
            <Activity size={14} />
            Live system
          </span>
        </div>
      </div>

      {/* ADMIN VIEW */}
      {role === "admin" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-card-inner">
              <div>
                <div className="stat-label">Total vessels</div>
                <div className="stat-kpi">{companyStats.total_vessels ?? 0}</div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
                <Ship size={18} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-inner">
              <div>
                <div className="stat-label">Active vessels</div>
                <div className="stat-kpi">{companyStats.active_vessels ?? 0}</div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
                <Activity size={18} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-inner">
              <div>
                <div className="stat-label">Open alerts</div>
                <div className="stat-kpi">{companyStats.risk_alerts ?? 0}</div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-red-900/60 text-red-100 flex items-center justify-center border border-red-700/70">
                <AlertTriangle size={18} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-inner">
              <div>
                <div className="stat-label">Total users</div>
                <div className="stat-kpi">{companyStats.total_users ?? 0}</div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
                <UsersIcon size={18} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPERATOR VIEW */}
      {role === "operator" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="stat-card-inner">
              <div>
                <div className="stat-label">Assigned vessels</div>
                <div className="stat-kpi">{companyStats.total_vessels ?? 0}</div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
                <Ship size={18} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-inner">
              <div>
                <div className="stat-label">Active voyages</div>
                <div className="stat-kpi">{companyStats.active_vessels ?? 0}</div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-900/60 text-emerald-100 flex items-center justify-center border border-emerald-600/70">
                <Activity size={18} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-inner">
              <div>
                <div className="stat-label">Alerts</div>
                <div className="stat-kpi">{companyStats.risk_alerts ?? 0}</div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-red-900/60 text-red-100 flex items-center justify-center border border-red-700/70">
                <AlertTriangle size={18} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEWER VIEW */}
      {role === "viewer" && (
        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-slate-900">Vessel overview</h2>
            <p className="text-slate-600 mt-1">
              You have read-only access to vessel tracking and reports.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="card xl:col-span-2">
          <div className="card-body">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-start justify-between gap-4 w-full">
                <div>
                  <button
                    type="button"
                    onClick={() => setMapFullscreen(true)}
                    className="group inline-flex items-center gap-2 text-left"
                    title="Open full-screen map"
                  >
                    <h2 className="text-lg font-semibold text-emerald-50 group-hover:text-emerald-200 transition">
                      Live vessel tracking
                    </h2>
                    <Expand size={16} className="text-emerald-200/80 group-hover:text-emerald-200 transition" />
                  </button>
                  <p className="text-sm text-emerald-200/80">
                    Safety zones and vessel positions update continuously.
                  </p>
                </div>

                {state?.fromVessels && (
                  <button
                    type="button"
                    onClick={() => navigate("/vessels", { state: { selectedVesselId } })}
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-800/70 bg-emerald-950/70 text-emerald-100 hover:bg-emerald-950 transition"
                    title="Back to vessels"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                )}
              </div>
              <span className="pill">
                <Activity size={14} />
                Real-time map
              </span>
            </div>

            <div className="h-[26rem] rounded-2xl overflow-hidden border border-emerald-900/70">
              <VesselMap initialView={mapView} onViewChange={setMapView} />
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-emerald-50">Recent activity</h2>
              <span className="text-xs text-emerald-200/80">Last 24h</span>
            </div>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-sky-500" />
                <div>
                  <div className="font-medium text-emerald-50">Vessel entered port</div>
                  <div className="text-emerald-200/80">MV Ocean Queen • Mumbai</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500" />
                <div>
                  <div className="font-medium text-emerald-50">Stopped movement detected</div>
                  <div className="text-emerald-200/80">MT Sea Explorer • Near Chennai</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
                <div>
                  <div className="font-medium text-emerald-50">Weather risk alert</div>
                  <div className="text-emerald-200/80">Arabian Sea • High severity</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <div className="font-medium text-emerald-50">New vessel registered</div>
                  <div className="text-emerald-200/80">Metadata synced successfully</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {mapFullscreen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMapFullscreen(false)}
          />
          <div className="absolute inset-4 md:inset-8 card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-900/70 bg-[#020617]/80">
              <div className="text-sm font-semibold text-emerald-50">
                Live vessel map (full screen)
              </div>
              {state?.fromVessels && (
                <button
                  type="button"
                  onClick={() => {
                    setMapFullscreen(false)
                    navigate("/vessels", { state: { selectedVesselId } })
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-800/70 bg-emerald-950/70 text-emerald-100 hover:bg-emerald-950 transition"
                >
                  <ArrowLeft size={16} />
                  Back to vessels
                </button>
              )}
              <button
                type="button"
                onClick={() => setMapFullscreen(false)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-800/70 bg-emerald-950/70 text-emerald-100 hover:bg-emerald-950 transition"
              >
                <X size={16} />
                Back
              </button>
            </div>
            <div className="h-[calc(100%-52px)]">
              <VesselMap
                initialView={mapView}
                onViewChange={setMapView}
                selectedVesselId={selectedVesselId}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
