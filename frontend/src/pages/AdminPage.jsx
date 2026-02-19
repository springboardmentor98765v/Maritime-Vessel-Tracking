import { Users, Ship, Anchor, Activity } from "lucide-react"

export default function AdminPage() {

  return (

    <div className="p-6">

      {/* Page Title */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <span className="text-sm text-gray-500">
          Welcome, Admin
        </span>
      </div>


      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-600 font-semibold">
              Total Users
            </h2>
            <Users className="text-blue-600" size={28} />
          </div>
          <p className="text-3xl font-bold mt-4">24</p>
        </div>


        {/* Active Vessels */}
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-600 font-semibold">
              Active Vessels
            </h2>
            <Ship className="text-green-600" size={28} />
          </div>
          <p className="text-3xl font-bold mt-4">12</p>
        </div>


        {/* Ports Monitored */}
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-600 font-semibold">
              Ports Monitored
            </h2>
            <Anchor className="text-purple-600" size={28} />
          </div>
          <p className="text-3xl font-bold mt-4">8</p>
        </div>

      </div>


      {/* Activity Section */}
      <div className="bg-white p-6 rounded-2xl shadow">

        <div className="flex items-center mb-4">
          <Activity className="mr-2 text-red-500" />
          <h2 className="text-xl font-bold">
            Recent Activity
          </h2>
        </div>

        <table className="w-full text-left">

          <thead>
            <tr className="border-b">
              <th className="py-2">User</th>
              <th>Status</th>
              <th>Vessel</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>

            <tr className="border-b hover:bg-gray-50">
              <td className="py-2">John</td>
              <td className="text-green-600">Active</td>
              <td>Sea Queen</td>
              <td>10:45 AM</td>
            </tr>

            <tr className="border-b hover:bg-gray-50">
              <td className="py-2">Rahul</td>
              <td className="text-yellow-600">Monitoring</td>
              <td>Ocean Star</td>
              <td>09:20 AM</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>

  )
}
