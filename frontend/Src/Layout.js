import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

function Layout() {
  const token = localStorage.getItem("token");

  // If no token → redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1b2a" }}>
      <Sidebar />

      {/* ── Main content area ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minWidth: 0,          // prevents flex child from overflowing
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
