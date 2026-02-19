import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/auth/PrivateRoute";
import DashboardPage from "../pages/DashboardPage";
import TrackingPage from "../pages/TrackingPage";
import LoginForm from "../components/auth/LoginForm";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/tracking"
        element={
          <PrivateRoute>
            <TrackingPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
