import VesselMap from "../maps/VesselMap"
import AlertPanel from "../alerts/AlertPanel"
import PortAnalytics from "../analytics/PortAnalytics"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <VesselMap />
        </div>
        <div className="col-span-1">
          <AlertPanel />
        </div>
      </div>

      {/* Bottom Section */}
      <PortAnalytics />
    </div>
  )
}
