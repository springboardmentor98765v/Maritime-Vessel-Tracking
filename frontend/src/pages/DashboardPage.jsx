import { useSelector } from "react-redux"
import VesselMap from "../components/maps/VesselMap"
import api from "../api/axios"
import { useEffect } from "react"

export default function DashboardPage() {

  const user = useSelector((state) => state.auth?.user)
  const role = user?.role || "viewer"   // admin | operator | viewer

  
  useEffect(() => {
    api.get("vessels/")
      .then(res => console.log(res.data))
      .catch(err => console.error(err))
    }, [])

  return (
    <div className="p-6 bg-slate-100 min-h-screen">

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Dashboard
      </h1>

      <p className="text-gray-600 mb-6">
        Welcome,
        <span className="font-semibold">
          {" "} {user?.name || "Maritime User"}
        </span>
        {" "} ({role})
      </p>

      {/* ADMIN VIEW */}
      {role === "admin" && (
        <div className="grid grid-cols-4 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
            <h2>Total Vessels</h2>
            <p className="text-3xl font-bold text-blue-600">128</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
            <h2>Active Vessels</h2>
            <p className="text-3xl font-bold text-green-600">96</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
            <h2>Alerts</h2>
            <p className="text-3xl font-bold text-red-600">12</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
            <h2>Total Users</h2>
            <p className="text-3xl font-bold text-purple-600">42</p>
          </div>

        </div>
      )}

      {/* OPERATOR VIEW */}
      {role === "operator" && (
        <div className="grid grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
            <h2>Assigned Vessels</h2>
            <p className="text-3xl font-bold text-blue-600">24</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
            <h2>Active Voyages</h2>
            <p className="text-3xl font-bold text-green-600">12</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
            <h2>Alerts</h2>
            <p className="text-3xl font-bold text-red-600">3</p>
          </div>

        </div>
      )}

      {/* VIEWER VIEW */}
      {role === "viewer" && (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold">
            Vessel Overview
          </h2>
          <p className="text-gray-600">
            You have read-only access to vessel tracking and reports.
          </p>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">

        <h2 className="text-xl font-bold mb-4">
          Recent Activity
        </h2>

        <ul className="space-y-2">
          <li>🚢 MV Ocean Queen entered Mumbai Port</li>
          <li>⚓ MT Sea Explorer stopped near Chennai</li>
          <li>⚠ Weather alert in Arabian Sea</li>
          <li>📋 New vessel registered</li>
        </ul>

      </div>

      {/* Vessel Map */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="text-xl font-bold mb-4">
          Live Vessel Tracking
        </h2>

        <div className="h-96">
          <VesselMap />
        </div>

      </div>

    </div>
  )
}
