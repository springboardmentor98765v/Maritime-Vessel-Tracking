import { useEffect, useState } from "react";
import { getPorts } from "../api/axios";
export default function Ports() {

  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPorts = async () => {
    try {

      const res = await getPorts();
      console.log("PORT DATA:" , res.data);
      setPorts(res.data);

    } catch (error) {

      console.log("Using dummy port data");

      setPorts([
        {
          port: "Singapore",
          arrivals: 120,
          departures: 115,
          congestion_score: 0.35
        },
        {
          port: "Rotterdam",
          arrivals: 90,
          departures: 85,
          congestion_score: 0.22
        },
        {
          port: "Dubai",
          arrivals: 150,
          departures: 140,
          congestion_score: 0.41
        }
      ]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  if (loading) {
    return <p>Loading Port Analytics...</p>;
  }
  const totalArrivals = ports.reduce((sum,p)=>sum+p.arrivals,0);
const totalDepartures = ports.reduce((sum,p)=>sum+p.departures,0);

const sortedPorts = [...ports].sort(
(a,b)=>b.congestion_score - a.congestion_score
);

  return (

<div className="ports-page">

<h2>🚢 Port Congestion Dashboard</h2>

{/* KPI SUMMARY */}

<div className="ports-summary">

<div className="summary-card">
<div className="card-icon">⚓</div>
<div>
<h3>{ports.length}</h3>
<p>Total Ports</p>
</div>
</div>

<div className="summary-card">
<div className="card-icon">📥</div>
<div>
<h3>{totalArrivals}</h3>
<p>Total Arrivals</p>
</div>
</div>

<div className="summary-card">
<div className="card-icon">📤</div>
<div>
<h3>{totalDepartures}</h3>
<p>Total Departures</p>
</div>
</div>


</div>

{/* PORT GRID */}

<div className="ports-table">

  <div className="ports-header">
    <span>Port</span>
    <span>Country</span>
    <span>Arrivals</span>
    <span>Departures</span>
    <span>Congestion</span>
  </div>

  {sortedPorts.map((port, index) => (
    <div className="ports-row" key={port.id || index}>

      <span className="port-name">
        {port.name }
      </span>

      <span>{port.country || "-"}</span>

      <span>{port.arrivals}</span>

      <span>{port.departures}</span>

      <span className="congestion-cell">

        <div className="congestion-bar">
          <div
            className="congestion-fill"
            style={{ width: `${port.congestion_score * 100}%` }}
          ></div>
        </div>

        <span className="congestion-value">
          {(port.congestion_score * 100).toFixed(0)}%
        </span>

      </span>

    </div>
  ))}

</div>

</div>

);
}