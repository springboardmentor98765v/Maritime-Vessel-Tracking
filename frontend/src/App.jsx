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
import ResetPasswordPage from './pages/ResetPasswordPage'

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
      <div className="mesh-bg" />
      <div className="app-bg-grid-wrapper">
        <div className="app-bg-grid" />
      </div>
      <Header />
      <LiveTicker />

      <main className="main-content">
        <Routes>
          {/* Auth pages: full-bleed, no container */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
          <Route path="/" element={<HomePage />} />

          {/* All other pages: wrapped in container */}
          <Route path="/*" element={
            <div className="container" style={{ paddingTop: '2rem' }}>
              <Routes>
                <Route path="/map" element={<MapPage />} />
                <Route path="/vessels" element={<VesselsPage />} />
                <Route path="/vessels/:id" element={<VesselDetailPage />} />
                <Route path="/ports" element={<PortsPage />} />
                <Route path="/voyages" element={<VoyageReplayPage />} />
                <Route path="/analytics" element={<AnalyticsDashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/update" element={<UpdateProfilePage />} />
                <Route path="/profile/change-password" element={<ChangePasswordPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
