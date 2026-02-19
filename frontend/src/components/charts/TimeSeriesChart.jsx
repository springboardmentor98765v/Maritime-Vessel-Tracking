import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function TimeSeriesChart({ data }) {
  return (
    <LineChart width={500} height={300} data={data}>
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#002b45" />
    </LineChart>
  );
}
