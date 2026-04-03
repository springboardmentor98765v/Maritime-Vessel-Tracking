import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Layout from "./components/Layout";

import AdminDashboard from "./pages/AdminDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import AnalystDashboard from "./pages/AnalystDashboard";
import Vessels from "./pages/Vessels";
import Notification from "./components/Notification";
import { Toaster } from "react-hot-toast";
import "./App.css";
import "leaflet/dist/leaflet.css";
import Ports from "./pages/Ports";
import PortCharts from "./components/PortCharts";
import MapView from "./components/MapView";
import AdminPanel from "./components/AdminPanel";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import RoleRoute from "./components/RoleRoute";
export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        

        <Route path="/admin" element={<RoleRoute role="admin"><Layout role="Admin" /></RoleRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="vessels" element={<Vessels />} />
          <Route path="map" element={<MapView />} />
          <Route path="notification" element={<Notification />} />
          <Route path="ports" element={<Ports />} />
          <Route path="portcharts" element={<PortCharts />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>

        <Route path="/operator" element={<RoleRoute role="operator"><Layout role="Operator" /></RoleRoute>}>
          <Route index element={<OperatorDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="vessels" element={<Vessels />} />
          <Route path="map" element={<MapView />} />
          <Route path="notification" element={<Notification />} />
          <Route path="ports" element={<Ports />} />
          <Route path="portcharts" element={<PortCharts />} />
        </Route>

        <Route path="/analyst" element={<RoleRoute role="analyst"><Layout role="Analyst" /></RoleRoute>}>
          <Route index element={<AnalystDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="vessels" element={<Vessels />} />
          <Route path="map" element={<MapView />} />
          <Route path="ports" element={<Ports />} />
          <Route path="portcharts" element={<PortCharts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}