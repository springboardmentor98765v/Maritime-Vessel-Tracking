import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { loginSuccess, logout } from "./stores/slices/authSlice"

// Pages
import LoginPage from "./pages/LoginPage"
import RegisterForm from "./components/auth/RegisterForm"
import HomePage from "./pages/HomePage"
import DashboardPage from "./pages/DashboardPage"
import AdminPage from "./pages/AdminPage"
import UsersPage from "./pages/UsersPage"
import ProfilePage from "./pages/ProfilePage"
import ReportPage from "./pages/ReportPage"
import SafetyPage from "./pages/SafetyPage"
import SettingsPage from "./pages/SettingsPage"
import VoyageHistoryPage from "./pages/VoyageHistoryPage"
import PortAnalyticsPage from "./pages/PortAnalyticsPage"
import VesselsPage from "./pages/VesselsPage"
import VesselDetailsPage from "./pages/VesselDetailsPage"
import PortDetail from "./components/ports/PortDetail"
import NotFoundPage from "./pages/NotFoundPage"

// Components
import PrivateRoute from "./components/auth/PrivateRoute"
import RoleRoute from "./components/auth/RoleRoute"
import PortStatistics from "./components/ports/PortStatistics"
import MainLayout from "./layouts/MainLayout"

// Service
import authService from "./services/authService"

export default function App() {

  const dispatch = useDispatch()

  // ✅ Restore user from token on refresh
  useEffect(() => {

    const token = localStorage.getItem("access_token")

    if (token) {

      authService.getProfile()
        .then(user => {

          dispatch(
            loginSuccess({
              user: user,
              token: token
            })
          )

        })
        .catch(() => {

          dispatch(logout())

        })

    }

  }, [dispatch])


  return (

    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LoginPage />} />
<Route path="/register" element={<RegisterForm />} />
        {/* PROTECTED */}

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <MainLayout>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminPage />
                </RoleRoute>
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/users"
          element={
            <PrivateRoute>
              <MainLayout>
                <RoleRoute allowedRoles={['admin']}>
                  <UsersPage />
                </RoleRoute>
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <MainLayout>
                <RoleRoute allowedRoles={['admin', 'analyst']}>
                  <ReportPage />
                </RoleRoute>
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/voyages"
          element={
            <PrivateRoute>
              <MainLayout>
                <VoyageHistoryPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/vessels"
          element={
            <PrivateRoute>
              <MainLayout>
                <VesselsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/vessels/:vessel_id"
          element={
            <PrivateRoute>
              <MainLayout>
                <VesselDetailsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/safety"
          element={
            <PrivateRoute>
              <MainLayout>
                <RoleRoute allowedRoles={['admin', 'analyst']}>
                  <SafetyPage />
                </RoleRoute>
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <MainLayout>
                <RoleRoute allowedRoles={['admin', 'analyst']}>
                  <PortAnalyticsPage />
                </RoleRoute>
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ports/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <RoleRoute allowedRoles={['admin', 'analyst']}>
                  <PortDetail />
                </RoleRoute>
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/port-statistics"
          element={
            <PrivateRoute>
              <MainLayout>
                <RoleRoute allowedRoles={['admin', 'analyst']}>
                  <PortStatistics />
                </RoleRoute>
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>

    </BrowserRouter>

  )

}
