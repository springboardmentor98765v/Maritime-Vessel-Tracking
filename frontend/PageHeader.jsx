// src/components/PageHeader.jsx
// Consistent header for all pages

import React from "react";
import { useNavigate } from "react-router-dom";

const PageHeader = ({
  title,
  subtitle,
  backPath = "/dashboard",
  backLabel = "← Back",
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && (
          <p className="page-subtitle">{subtitle}</p>
        )}
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {children}
        <button
          className="btn-secondary"
          onClick={() => navigate(backPath)}
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
};

export default PageHeader;