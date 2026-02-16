import { NavLink } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

const linkClass = ({ isActive }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link'

function Header() {
  const { isAuthenticated, logout } = useAuthContext()

  return (
    <header className="header">
      <div className="container header__inner">
        <div className="brand">
          <span className="brand__mark">MV</span>
          <div>
            <div className="brand__title">Maritime Vista</div>
            <div className="brand__subtitle">Vessel Intelligence Hub</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" className={linkClass} end>
            Overview
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}

          {!isAuthenticated && (
            <NavLink to="/login" className={linkClass}>
              Sign in
            </NavLink>
          )}
        </nav>

        <div className="header__actions">
          {isAuthenticated ? (
            <button
              type="button"
              className="button button--ghost"
              onClick={logout}
            >
              Sign out
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
