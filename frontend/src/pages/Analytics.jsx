import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function Analytics() {

  const [ports, setPorts] = useState([]);

  useEffect(() => {
    fetchPorts();
  }, []);

  const fetchPorts = async () => {

    try {

      const res = await fetch("http://127.0.0.1:8000/tracking/ports/");
      const data = await res.json();

      setPorts(data);

    } catch {

      setPorts([
        { port_name: "Singapore", arrivals: 120, departures: 115, congestion_score: 0.35 },
        { port_name: "Rotterdam", arrivals: 90, departures: 85, congestion_score: 0.22 },
        { port_name: "Dubai", arrivals: 150, departures: 140, congestion_score: 0.41 }
      ]);

    }

  };

  return (

    <div className="analytics-page">

      <h2>Port Traffic Analytics</h2>

      {/* Chart 1 */}

      <div className="chart-box">

        <h3>Arrivals vs Departures</h3>

        <ResponsiveContainer width="100%" height={320}>

          <BarChart data={ports}>

            <XAxis dataKey="port_name" />
            <YAxis />
            <Tooltip />

            <Bar dataKey="arrivals" fill="#4CAF50" />
            <Bar dataKey="departures" fill="#FF9800" />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* Chart 2 */}

      <div className="chart-box">

        <h3>Port Congestion Levels</h3>

        <ResponsiveContainer width="100%" height={320}>

          <LineChart data={ports}>

            <XAxis dataKey="port_name" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="congestion_score"
              stroke="#ff4d4f"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

  );

}