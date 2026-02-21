import { NavLink } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

const links = [
    { to: '/', label: 'Overview', end: true },
    { to: '/map', label: 'Map' },
    { to: '/vessels', label: 'Vessels' },
    { to: '/ports', label: 'Ports' },
]

const authLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
]

function Header() {
    const { isAuthenticated, logout } = useAuthContext()

    return (
        <header className="header">
            <div className="container header__inner">

                {/* Brand */}
                <NavLink to="/" className="brand">
                    <span className="brand__mark">MV</span>
                    <div>
                        <span className="brand__title">Maritime Vista</span>
                        <span className="brand__subtitle">Vessel Intelligence Hub</span>
                    </div>
                </NavLink>

                {/* Nav */}
                <nav className="nav" aria-label="Main navigation">
                    {links.map(({ to, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
                        >
                            {label}
                        </NavLink>
                    ))}
                    {isAuthenticated && authLinks.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Actions */}
                <div className="header__actions">
                    {isAuthenticated ? (
                        <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
                            Sign out
                        </button>
                    ) : (
                        <>
                            <NavLink to="/login" className="btn btn--ghost btn--sm">Sign in</NavLink>
                            <NavLink to="/register" className="btn btn--primary btn--sm">Get started</NavLink>
                        </>
                    )}
                </div>

            </div>
        </header>
    )
}

export default Header
