// src/components/ErrorMessage.jsx
// Consistent error state

import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorMessage = ({
  message = "Something went wrong",
  backPath = "/dashboard",
}) => {
  const navigate = useNavigate();

  return (
    <div style={{
      background:     "#0d1b2a",
      minHeight:      "100vh",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      color:          "#fff",
      gap:            "16px",
      padding:        "30px",
    }}>
      <div style={{ fontSize: "48px" }}>⚠️</div>
      <div className="error-box">
        <span>❌</span>
        <span>{message}</span>
      </div>
      <button
        className="btn-primary"
        onClick={() => navigate(backPath)}
      >
        ← Go Back
      </button>
    </div>
  );
};

export default ErrorMessage;