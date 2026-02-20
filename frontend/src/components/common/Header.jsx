import { NavLink } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

const linkClass = ({ isActive }) =>
  isActive
    ? 'text-white'
    : 'text-slate-300 hover:text-white transition-colors'

function Header() {
  const { isAuthenticated, logout } = useAuthContext()

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-5 gap-6">

          {/* Brand Section */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 
                            flex items-center justify-center text-slate-900 font-bold">
              MV
            </div>
            <div>
              <div className="font-bold text-white tracking-wide">Maritime Vista</div>
              <div className="text-xs text-slate-400">Vessel Intelligence Hub</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex gap-6 text-sm">
            <NavLink to="/" className={linkClass} end>
              Overview
            </NavLink>

            <NavLink to="/map" className={linkClass}>
              🗺 Map
            </NavLink>

            <NavLink to="/vessels" className={linkClass}>
              🚢 Vessels
            </NavLink>

            <NavLink to="/ports" className={linkClass}>
              ⚓ Ports
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>

                <NavLink to="/profile" className={linkClass}>
                  My Profile
                </NavLink>
              </>
            )}

            {!isAuthenticated && (
              <NavLink to="/login" className={linkClass}>
                Sign in
              </NavLink>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl border border-white/30 text-white 
                           hover:bg-white/10 transition-colors"
                onClick={logout}
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/register"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 
                           text-slate-900 font-semibold shadow-lg shadow-cyan-500/50 
                           hover:-translate-y-0.5 transition-transform"
              >
                Create account
              </NavLink>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header
