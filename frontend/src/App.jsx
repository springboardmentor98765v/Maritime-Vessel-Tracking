import { Route, Routes } from 'react-router-dom'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import PrivateRoute from './components/auth/PrivateRoute'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'

// ✅ NEW PAGES
import ProfilePage from './pages/ProfilePage'
import UpdateProfilePage from './pages/UpdateProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-14 px-4">
        <div className="max-w-7xl mx-auto w-full">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

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
