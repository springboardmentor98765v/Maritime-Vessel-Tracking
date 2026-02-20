import './App.css'
import { Route, Routes } from 'react-router-dom'
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

// ✅ Milestone 2 pages
import MapPage from './pages/MapPage'
import VesselsPage from './pages/VesselsPage'
import VesselDetailPage from './pages/VesselDetailPage'

// ✅ Milestone 3 pages
import PortsPage from './pages/PortsPage'

function App() {
  return (
    <div className="app-shell">
      <Header />

      <main className="main-content">
        <div className="container">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ✅ Milestone 2 — public vessel routes */}
            <Route path="/map" element={<MapPage />} />
            <Route path="/vessels" element={<VesselsPage />} />
            <Route path="/vessels/:id" element={<VesselDetailPage />} />

            {/* ✅ Milestone 3 — port congestion routes */}
            <Route path="/ports" element={<PortsPage />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* ✅ Profile routes */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/update" element={<UpdateProfilePage />} />
              <Route
                path="/profile/change-password"
                element={<ChangePasswordPage />}
              />
            </Route>

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
