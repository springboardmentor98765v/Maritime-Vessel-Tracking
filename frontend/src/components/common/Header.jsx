import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import api from '../../services/api'

const links = [
    { to: '/', label: 'Overview', end: true },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/map', label: 'Map' },
    { to: '/vessels', label: 'Vessels' },
    { to: '/ports', label: 'Ports' },
    { to: '/voyages', label: 'Voyages' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/admin', label: 'Admin' },
    { to: '/profile', label: 'Profile' },
]

function Header() {
    const { isAuthenticated, logout } = useAuthContext()
    const [notifications, setNotifications] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchNotifs = async () => {
            try {
                const res = await api.get('/notifications/')
                setNotifications(res.data)
            } catch (err) {
                console.error("Failed to fetch notifications:", err)
            }
        }
        fetchNotifs()
        const interval = setInterval(fetchNotifs, 30000)
        return () => clearInterval(interval)
    }, [isAuthenticated])

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read/`)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        } catch (err) {
            console.error(err)
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

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
                </nav>

                {/* Actions */}
                <div className="header__actions" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {isAuthenticated ? (
                        <>
                            <div className="notifications-wrapper" style={{ position: 'relative' }}>
                                <button className="btn btn--ghost btn--sm" onClick={() => setShowDropdown(!showDropdown)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                                    {unreadCount > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.68rem', marginLeft: '2px' }}>{unreadCount}</span>}
                                </button>
                                {showDropdown && (
                                    <div style={{ position: 'absolute', right: 0, top: '40px', width: '300px', background: 'var(--surface-50)', border: '1px solid var(--surface-100)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1000, maxHeight: '400px', overflowY: 'auto' }}>
                                        <div style={{ padding: '10px', borderBottom: '1px solid var(--surface-100)', fontWeight: '600' }}>Notifications</div>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-weak)' }}>No notifications</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} style={{ padding: '10px', borderBottom: '1px solid var(--surface-100)', background: n.is_read ? 'transparent' : 'rgba(255, 255, 255, 0.05)' }}>
                                                    <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>{n.message}</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-weak)' }}>
                                                        <span>{new Date(n.timestamp).toLocaleString()}</span>
                                                        {!n.is_read && (
                                                            <button onClick={() => markAsRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.75rem' }}>Mark Read</button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
                                Sign out
                            </button>
                        </>
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
