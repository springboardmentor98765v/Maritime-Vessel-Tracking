import { NavLink } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

const linkClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link'

function Header() {
  const { isAuthenticated, logout } = useAuthContext()

  return (
    <header className="header">
      <div className="container header__inner">

        {/* Brand Section */}
        <div className="brand">
          <span className="brand__mark">MV</span>
          <div>
            <div className="brand__title">Maritime Vista</div>
            <div className="brand__subtitle">Vessel Intelligence Hub</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav">
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
        <div className="header__actions">
          {isAuthenticated ? (
            <button
              type="button"
              className="button button--ghost"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <NavLink to="/register" className="button button--primary">
              Create account
            </NavLink>
          )}
        </div>

      </div>
    </header>
  )
}

export default Header
