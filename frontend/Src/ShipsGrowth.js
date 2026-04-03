import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from "recharts";

const data = [
  { year: "2019", ships: 120, growth: null  },
  { year: "2020", ships: 180, growth: 50    },
  { year: "2021", ships: 220, growth: 22.2  },
  { year: "2022", ships: 260, growth: 18.2  },
  { year: "2023", ships: 320, growth: 23.1  },
  { year: "2024", ships: 400, growth: 25.0  },
];

const stats = [
  { label: "Fleet Size (2024)", value: "400",  icon: "🚢", color: "#1e88e5" },
  { label: "Growth vs 2019",    value: "+233%", icon: "📈", color: "#43a047" },
  { label: "Avg Annual Growth", value: "+27",   icon: "⚓", color: "#fb8c00" },
  { label: "Peak Year",         value: "2024",  icon: "🏆", color: "#9c27b0" },
];

function ShipsGrowth() {
  const navigate = useNavigate();

  return (
    <div className="page-fade page-container">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Ships Growth</h1>
          <p className="page-subtitle">Global maritime fleet growth over time</p>
        </div>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card card-hover" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Area Chart ── */}
      <div className="section-card" style={{ marginBottom: "20px" }}>
        <h3 className="section-title">🚢 Fleet Size by Year</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="shipGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1e88e5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1e88e5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3d4f" />
            <XAxis dataKey="year" stroke="#90caf9" tick={{ fill: "#ccc", fontSize: 13 }} />
            <YAxis stroke="#90caf9" tick={{ fill: "#ccc", fontSize: 13 }} />
            <Tooltip
              contentStyle={{
                background: "#1e2a3a",
                border: "1px solid #42a5f5",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value) => [`${value} ships`, "Fleet Size"]}
            />
            <ReferenceLine y={300} stroke="#fb8c00" strokeDasharray="4 4" label={{ value: "Target", fill: "#fb8c00", fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="ships"
              stroke="#1e88e5"
              strokeWidth={3}
              fill="url(#shipGradient)"
              dot={{ fill: "#1e88e5", r: 5, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 7 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Annual Growth Rate Bar ── */}
      <div className="section-card" style={{ marginBottom: "20px" }}>
        <h3 className="section-title">📊 Year-on-Year Growth (ships added)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={data.filter((d) => d.growth !== null)}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3d4f" />
            <XAxis dataKey="year" stroke="#90caf9" tick={{ fill: "#ccc", fontSize: 13 }} />
            <YAxis stroke="#90caf9" tick={{ fill: "#ccc", fontSize: 13 }} unit="%" />
            <Tooltip
              contentStyle={{
                background: "#1e2a3a",
                border: "1px solid #43a047",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value) => [`${value.toFixed(1)}%`, "Growth Rate"]}
            />
            <Line
              type="monotone"
              dataKey="growth"
              stroke="#43a047"
              strokeWidth={3}
              dot={{ fill: "#43a047", r: 5, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Data Table ── */}
      <div className="section-card">
        <h3 className="section-title">📋 Year-by-Year Data</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Fleet Size</th>
                <th>Ships Added</th>
                <th>Growth Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const added = i > 0 ? row.ships - data[i - 1].ships : "—";
                return (
                  <tr key={row.year}>
                    <td style={{ fontWeight: "600", color: "#90caf9" }}>{row.year}</td>
                    <td>
                      <strong style={{ color: "#1e88e5" }}>{row.ships}</strong>
                    </td>
                    <td style={{ color: "#43a047" }}>
                      {typeof added === "number" ? `+${added}` : added}
                    </td>
                    <td>
                      {row.growth !== null ? (
                        <span
                          className="badge"
                          style={{
                            background:
                              row.growth > 20 ? "#43a047" :
                              row.growth > 10 ? "#fb8c00" : "#1e88e5",
                          }}
                        >
                          +{row.growth.toFixed(1)}%
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default ShipsGrowth;