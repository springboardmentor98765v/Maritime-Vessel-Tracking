export default function DashboardCard({ title, value, color, icon }) {
  const borderColor = `border-${color}-500`;
  const textColor = `text-${color}-600`;

  return (
    <div className={`bg-white p-6 rounded-xl shadow border-l-4 ${borderColor} flex items-center gap-4`}>
      <div className="text-gray-400">{icon}</div>
      <div>
        <h2 className="text-gray-500 text-sm">{title}</h2>
        <p className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}
