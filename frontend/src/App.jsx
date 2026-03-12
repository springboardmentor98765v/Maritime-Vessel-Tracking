import { Route, Routes, useLocation } from 'react-router-dom'
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

// Pages that need full viewport width — no container wrapping
const FULL_WIDTH_PAGES = ['/map', '/voyages']

function PageWrapper({ children }) {
  const location = useLocation()
  const isFullWidth = FULL_WIDTH_PAGES.some(p => location.pathname.startsWith(p))

  if (isFullWidth) {
    return <>{children}</>
  }
  return (
    <div className="page-container">
      {children}
    </div>
  )
}

function App() {
  return (
    <div className="app-shell">
      <Header />

      <main className="main-content">
        <Routes>
          {/* Full-width pages */}
          <Route path="/map" element={<MapPage />} />
          <Route path="/voyages" element={<VoyageReplayPage />} />

          {/* Contained pages */}
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
          <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
          <Route path="/reset-password/:uid/:token" element={<PageWrapper><ResetPasswordPage /></PageWrapper>} />
          <Route path="/vessels" element={<PageWrapper><VesselsPage /></PageWrapper>} />
          <Route path="/vessels/:id" element={<PageWrapper><VesselDetailPage /></PageWrapper>} />
          <Route path="/ports" element={<PageWrapper><PortsPage /></PageWrapper>} />
          <Route path="/analytics" element={<PageWrapper><AnalyticsDashboardPage /></PageWrapper>} />

          {/* Protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<PageWrapper><DashboardPage /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
            <Route path="/profile/update" element={<PageWrapper><UpdateProfilePage /></PageWrapper>} />
            <Route path="/profile/change-password" element={<PageWrapper><ChangePasswordPage /></PageWrapper>} />
            <Route path="/admin" element={<PageWrapper><AdminPage /></PageWrapper>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
