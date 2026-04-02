import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/auth/PrivateRoute";
import DashboardPage from "../pages/DashboardPage";
import TrackingPage from "../pages/TrackingPage";
import VesselsPage from "../pages/VesselsPage";
import UsersPage from "../pages/UsersPage";
import ProfilePage from "../pages/ProfilePage";
import VoyageHistoryPage from "../pages/VoyageHistoryPage";
import PortAnalyticsPage from "../pages/PortAnalyticsPage";
import ReportPage from "../pages/ReportPage";
import SafetyPage from "../pages/SafetyPage";
import SettingsPage from "../pages/SettingsPage";
import AdminPage from "../pages/AdminPage";
import HomePage from "../pages/HomePage";
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

      <Route
        path="/vessels"
        element={
          <PrivateRoute>
            <VesselsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/users"
        element={
          <PrivateRoute>
            <UsersPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/voyages"
        element={
          <PrivateRoute>
            <VoyageHistoryPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <PortAnalyticsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/port-statistics"
        element={
          <PrivateRoute>
            <PortAnalyticsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <ReportPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/safety"
        element={
          <PrivateRoute>
            <SafetyPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
