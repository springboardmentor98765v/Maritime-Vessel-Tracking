// src/components/LoadingSpinner.jsx
// Consistent loading state

import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div style={{
    background:      "#0d1b2a",
    minHeight:       "100vh",
    display:         "flex",
    flexDirection:   "column",
    alignItems:      "center",
    justifyContent:  "center",
    color:           "#fff",
    gap:             "16px",
  }}>
    <div className="spinner" />
    <p style={{ color: "#90caf9", fontSize: "14px" }}>{message}</p>
  </div>
);

export default LoadingSpinner;