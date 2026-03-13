import { Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import PrivateRoute from './components/auth/PrivateRoute'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'

import ProfilePage from './pages/ProfilePage'
import UpdateProfilePage from './pages/UpdateProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

import MapPage from './pages/MapPage'
import VesselsPage from './pages/VesselsPage'
import VesselDetailPage from './pages/VesselDetailPage'
import PortsPage from './pages/PortsPage'
import VoyageReplayPage from './pages/VoyageReplayPage'
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage'
import AdminPage from './pages/AdminPage'

import LiveTicker from './components/common/LiveTicker'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <LiveTicker />

      <main className="main-content">
        <div className="container">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/vessels" element={<VesselsPage />} />
            <Route path="/vessels/:id" element={<VesselDetailPage />} />
            <Route path="/ports" element={<PortsPage />} />
            <Route path="/voyages" element={<VoyageReplayPage />} />
            <Route path="/analytics" element={<AnalyticsDashboardPage />} />

            {/* Protected (Now Public) */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/update" element={<UpdateProfilePage />} />
            <Route path="/profile/change-password" element={<ChangePasswordPage />} />
            <Route path="/admin" element={<AdminPage />} />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
