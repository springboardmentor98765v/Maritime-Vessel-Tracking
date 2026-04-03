import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import PortAnalysis from "./pages/PortAnalysis";
import ShipsGrowth from "./pages/ShipsGrowth";

import VesselDetail from "./pages/VesselDetail";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./routes/ProtectedRoute";
import VoyageReplay from "./pages/VoyageReplay"; 
import CompanyDashboard  from "./pages/CompanyDashboard";
import PortDashboardPage from "./pages/PortDashboardPage";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public Routes (Milestone 1 - unchanged) ── */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected Layout Routes ── */}
        <Route element={<Layout />}>

          {/* Milestone 1 routes - ALL UNCHANGED */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-tracking" element={<MapPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/port-analysis" element={<PortAnalysis />} />
          <Route path="/ships-growth" element={<ShipsGrowth />} />
          <Route path="/voyages/:id/replay" element={<VoyageReplay />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/port-dashboard"    element={<PortDashboardPage />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          
          {/* ── Milestone 2 NEW routes ── */}
          <Route
            path="/vessel/:id"
            element={
              <ProtectedRoute>
                <VesselDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;