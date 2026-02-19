import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function CongestionChart({ data }) {

  const getBarColor = (score) => {
    if (score >= 75) return "#ef4444"; // High
    if (score >= 40) return "#f59e0b"; // Moderate
    return "#22c55e"; // Low
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold text-gray-700 mb-4">
        Port Congestion Levels
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="port" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="congestionScore">
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={getBarColor(entry.congestionScore)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-6 mt-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-500 rounded"></span>
          Low (0–39)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-500 rounded"></span>
          Moderate (40–74)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-500 rounded"></span>
          High (75–100)
        </span>
      </div>

    </div>
  );
}
