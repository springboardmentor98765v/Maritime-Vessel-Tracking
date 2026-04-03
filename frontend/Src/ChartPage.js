import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const data = [
  { port: "Mumbai", vessels: 40 },
  { port: "Singapore", vessels: 65 },
  { port: "Dubai", vessels: 50 },
  { port: "Rotterdam", vessels: 80 },
];

function ChartPage() {
  return (
    <div>
      <h2>Port Analytics</h2>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="port" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="vessels" fill="#0a1f44" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartPage;

