import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

const data = [
  { port: "Chennai", vessels: 18 },
  { port: "Mumbai", vessels: 25 },
  { port: "Vizag", vessels: 12 },
  { port: "Kolkata", vessels: 9 },
]

export default function PortAnalytics() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">
        Port Vessel Congestion
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="port" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="vessels" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
