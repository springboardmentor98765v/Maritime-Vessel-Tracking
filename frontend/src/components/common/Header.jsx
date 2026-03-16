import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, LogOut, User, Ship, Settings, Command } from 'lucide-react'
import CommandPalette from './CommandPalette'

const links = [
    { to: '/', label: 'Overview', end: true },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/map', label: 'Live Map' },
    { to: '/vessels', label: 'Vessel Tracking' },
    { to: '/ports', label: 'Port Analytics' },
    { to: '/voyages', label: 'Voyage Replay' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/admin', label: 'Admin' }
]

function Header() {
    const { isAuthenticated, logout } = useAuthContext()
    const [notifications, setNotifications] = useState([])
    const [showNotifs, setShowNotifs] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [showCommand, setShowCommand] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const notifRef = useRef(null)
    const profileRef = useRef(null)

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

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
        }
        document.addEventListener('mousedown', handleClickOutside)

        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setShowCommand(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

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
        <header className="header" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface-50)', backdropFilter: 'blur(24px) saturate(150%)', WebkitBackdropFilter: 'blur(24px) saturate(150%)', borderBottom: '1px solid var(--border)' }}>
            <div className="container header__inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 0' }}>

                {/* Brand */}
                <NavLink to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <div className="brand__mark" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-grad)', display: 'grid', placeItems: 'center', boxShadow: '0 0 16px rgba(0, 229, 255, 0.25)' }}>
                        <Ship size={18} color="#030B18" strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="brand__title" style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', display: 'block', fontFamily: '"Inter", sans-serif' }}>Maritime Vista</span>
                        <span className="brand__subtitle" style={{ fontSize: '0.65rem', color: 'var(--brand-accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Intelligence Hub</span>
                    </div>
                </NavLink>

                {/* Central Navigation */}
                <nav className="nav" aria-label="Main navigation" style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                    {links.map(({ to, label, end }) => {
                        const isActive = end ? location.pathname === to : location.pathname.startsWith(to)
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                style={{
                                    position: 'relative',
                                    padding: '0.5rem 0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: isActive ? 500 : 500,
                                    color: isActive ? '#fff' : 'var(--text-1)',
                                    transition: 'all 0.2s ease',
                                    zIndex: 1,
                                    letterSpacing: '0.01em',
                                    textDecoration: 'none'
                                }}
                                onMouseOver={(e) => { if (!isActive) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textShadow = '0 0 8px rgba(255,255,255,0.3)'; } }}
                                onMouseOut={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.textShadow = 'none'; } }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="navIndicator"
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            bottom: '-2px',
                                            height: '2px',
                                            background: 'var(--brand-primary)',
                                            boxShadow: '0 -2px 12px rgba(59, 164, 255, 0.6)',
                                            borderRadius: '2px',
                                            zIndex: -1
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {label}
                            </NavLink>
                        )
                    })}
                </nav>

                {/* Actions */}
                <div className="header__actions" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

                    {/* System Status Indicator - Operational Pulse badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.75rem', background: 'rgba(0, 200, 83, 0.1)', border: '1px solid rgba(0, 200, 83, 0.2)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', cursor: 'default' }}>
                        <div style={{ position: 'relative', width: 6, height: 6 }}>
                            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--success)' }} />
                            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--success)', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                        </div>
                        Operational
                    </div>

                    {/* Expandable Command Palette Trigger */}
                    <motion.button
                        whileHover={{ width: '150px' }}
                        initial={{ width: '130px' }}
                        onClick={() => setShowCommand(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.35rem 0.6rem', color: 'var(--text-1)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: '"Inter", sans-serif', transition: 'all 0.2sease', overflow: 'hidden', whiteSpace: 'nowrap' }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.color = '#fff' }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-1)' }}
                    >
                        <Command size={14} color="var(--text-2)" style={{ flexShrink: 0 }} /> <span style={{ marginRight: 'auto', opacity: 0.8 }}>Search...</span> <kbd style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.65rem', color: 'var(--text-2)', fontFamily: 'monospace', flexShrink: 0 }}>⌘K</kbd>
                    </motion.button>

                    {isAuthenticated ? (
                        <>
                            {/* Notifications Dropdown */}
                            <div ref={notifRef} style={{ position: 'relative' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', color: 'var(--text-1)', padding: '0.4rem' }}
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            style={{ position: 'absolute', top: '2px', right: '4px', background: 'var(--brand-cyan)', color: '#000', fontSize: '0.65rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            {unreadCount}
                                        </motion.span>
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {showNotifs && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            style={{ position: 'absolute', right: 0, top: '48px', width: '320px', background: 'var(--surface-50)', border: '1px solid var(--border-hi)', borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: '600', fontSize: '0.9rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                Notifications
                                                {unreadCount > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--brand-cyan)', background: 'rgba(34,211,238,0.1)', padding: '2px 8px', borderRadius: '12px' }}>{unreadCount} New</span>}
                                            </div>
                                            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                                                {notifications.length === 0 ? (
                                                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-2)', fontSize: '0.85rem' }}>You're all caught up.</div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: n.is_read ? 'transparent' : 'rgba(34, 211, 238, 0.05)', transition: 'background 0.2s' }}>
                                                            <div style={{ fontSize: '0.85rem', color: n.is_read ? 'var(--text-1)' : '#fff', fontWeight: n.is_read ? 400 : 500, marginBottom: '6px' }}>{n.message}</div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-2)' }}>{new Date(n.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                                {!n.is_read && (
                                                                    <button onClick={() => markAsRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--brand-cyan)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Mark Read</button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* User Profile Dropdown */}
                            <div ref={profileRef} style={{ position: 'relative' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(99,102,241,0.15))', border: '1px solid var(--border)', color: 'var(--brand-cyan)', cursor: 'pointer' }}
                                >
                                    <User size={18} />
                                </motion.button>

                                <AnimatePresence>
                                    {showProfile && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            style={{ position: 'absolute', right: 0, top: '48px', width: '220px', background: 'var(--surface-50)', border: '1px solid var(--border-hi)', borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', padding: '0.5rem' }}
                                        >
                                            <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.25rem' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Logged In</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--brand-cyan)' }}>Active Session</div>
                                            </div>
                                            <button
                                                onClick={() => { navigate('/profile'); setShowProfile(false); }}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--text-1)', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s', textAlign: 'left' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <Settings size={16} /> My Settings
                                            </button>
                                            <button
                                                onClick={logout}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s', textAlign: 'left', marginTop: '0.25rem' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <LogOut size={16} /> Sign out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="btn btn--ghost btn--sm" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>Sign in</NavLink>
                            <NavLink to="/register" className="btn btn--primary btn--sm" style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem', boxShadow: '0 4px 14px rgba(34,211,238,0.3)' }}>Get started</NavLink>
                        </>
                    )}
                </div>

            </div>

            <CommandPalette isOpen={showCommand} onClose={() => setShowCommand(false)} />
        </header>
    )
}

export default Header
