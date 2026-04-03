import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import { useEffect, useState } from "react";
import { getPorts } from "../api/axios";

export default function PortCharts({ ports: propPorts }) {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const formatPorts = (data) => {
      return (data || [])
        .map((item) => ({
          port: item.name || item.port,
          arrivals: Number(item.arrivals || 0),
          departures: Number(item.departures || 0),
          congestion_score: Number(item.congestion_score || 0),
        }))
        .sort((a, b) => b.congestion_score - a.congestion_score)
        .slice(0, 10);
    };

    const fetchPorts = async () => {
      try {
        setLoading(true);
        const res = await getPorts();
        const data = res.data?.results || res.data || [];
        setPorts(formatPorts(data));
      } catch (error) {
        console.log("Error fetching port data", error);
        setPorts([]);
      } finally {
        setLoading(false);
      }
    };

    if (propPorts && propPorts.length > 0) {
      setPorts(formatPorts(propPorts));
      setLoading(false);
    } else {
      fetchPorts();
    }
  }, [propPorts]);

  if (loading) {
    return <p>Loading chart data...</p>;
  }

  if (!ports || ports.length === 0) {
    return <p>No chart data available.</p>;
  }

  return (
    <div className="port-charts-container" style={{ marginTop: "40px" }}>
      <h3>Top 10 Port Analytics Charts</h3>

      <div
        className="charts-grid"
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "20px"
        }}
      >
        <div
          className="chart-box"
          style={{
            flex: 1,
            minWidth: "300px",
            height: "380px",
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          <h4 style={{ marginBottom: "15px", color: "#333" }}>
            Arrivals vs Departures
          </h4>

          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={ports}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="port"
                angle={-20}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="arrivals" fill="#3b82f6" name="Arrivals" />
              <Bar dataKey="departures" fill="#10b981" name="Departures" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className="chart-box"
          style={{
            flex: 1,
            minWidth: "300px",
            height: "380px",
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          <h4 style={{ marginBottom: "15px", color: "#333" }}>
            Congestion Score
          </h4>

          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={ports}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="port"
                angle={-20}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="congestion_score"
                fill="#ef4444"
                name="Congestion Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}