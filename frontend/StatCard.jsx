// src/components/StatCard.jsx
// Consistent stat card for dashboards

import React from "react";

const StatCard = ({ icon, value, label, color = "#1e88e5" }) => (
  <div
    className="stat-card"
    style={{ borderLeft: `4px solid ${color}` }}
  >
    <div style={{ fontSize: "28px" }}>{icon}</div>
    <div className="stat-value" style={{ color }}>
      {value}
    </div>
    <div className="stat-label">{label}</div>
  </div>
);

export default StatCard;