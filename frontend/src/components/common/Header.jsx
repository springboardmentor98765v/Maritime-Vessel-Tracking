import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, LogOut, User, Ship, Settings, Command, Menu, X } from 'lucide-react'
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const notifRef = useRef(null)
    const profileRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

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

    useEffect(() => {
        setMobileMenuOpen(false)
    }, [location.pathname])

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read/`)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        } catch (err) {
            console.error(err)
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    const headerBg = scrolled ? 'rgba(4, 10, 24, 0.95)' : 'rgba(4, 10, 24, 0.8)'
    const headerBlur = scrolled ? 'blur(12px)' : 'blur(8px)'
    const headerBorder = scrolled ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid transparent'
    const headerShadow = scrolled ? '0 12px 40px rgba(0,0,0,0.5)' : 'none'

    return (
        <header 
            className="header" 
            style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 100, 
                background: headerBg, 
                backdropFilter: headerBlur, 
                WebkitBackdropFilter: headerBlur, 
                borderBottom: headerBorder,
                boxShadow: headerShadow,
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', gap: '2rem' }}>

                {/* Left: Logo */}
                <div style={{ flex: '1 1 0%', display: 'flex', justifyContent: 'flex-start' }}>
                    <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', position: 'relative', zIndex: 110 }}>
                    <motion.div 
                        whileHover={{ scale: 1.05, rotate: 5, boxShadow: '0 0 24px rgba(34,211,238,0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #00E5FF, #0055FF)', display: 'grid', placeItems: 'center', boxShadow: '0 0 16px rgba(0, 229, 255, 0.3), inset 0 2px 4px rgba(255,255,255,0.4)', position: 'relative', overflow: 'hidden' }}
                    >
                        <motion.div 
                            animate={{ x: ['-200%', '200%'] }} 
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }} 
                            style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', transform: 'skewX(-20deg)', width: '50%' }} 
                        />
                        <Ship size={20} color="#030B18" strokeWidth={2.5} style={{ zIndex: 1 }} />
                    </motion.div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1, fontFamily: '"Space Grotesk", sans-serif' }}>Maritime Vista</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--brand-cyan)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>Intelligence OS</span>
                    </div>
                </NavLink>
                </div>

                {/* Center: Navigation */}
                <div style={{ flex: '0 1 auto', display: 'flex', justifyContent: 'center' }}>
                    <nav className="nav" aria-label="Main navigation" style={{ display: 'none', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)' }}>
                    <style>{`@media(min-width: 1100px) { .nav { display: flex !important; } }`}</style>
                    {links.map(({ to, label, end }) => {
                        const isActive = end ? location.pathname === to : location.pathname.startsWith(to)
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                style={{
                                    position: 'relative',
                                    padding: '0.35rem 0.75rem',
                                    fontSize: '13px',
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                                    transition: 'color 0.2s',
                                    zIndex: 1,
                                    letterSpacing: '0.01em',
                                    textDecoration: 'none',
                                    borderRadius: '10px'
                                }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="navIndicator"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                                            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)',
                                            borderRadius: '10px',
                                            zIndex: -1
                                        }}
                                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                    />
                                )}
                                {label}
                            </NavLink>
                        )
                    })}
                </nav>
                </div>

                {/* Right: Actions */}
                <div style={{ flex: '1 1 0%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', position: 'relative', zIndex: 110 }}>
                    <div style={{ display: 'none' }} className="cmdkr"><style>{`@media(min-width: 900px) { .cmdkr { display: block !important; } }`}</style>
                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCommand(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer', fontFamily: '"Inter", sans-serif', transition: 'all 0.2s', whiteSpace: 'nowrap', width: '180px' }}
                        >
                            <Command size={14} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} /> 
                            <span style={{ marginRight: 'auto' }}>Search...</span> 
                            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', color: '#fff', fontFamily: 'monospace', flexShrink: 0 }}>⌘K</kbd>
                        </motion.button>
                    </div>

                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div ref={notifRef} style={{ position: 'relative' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', color: '#fff', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--brand-cyan)', color: '#000', fontSize: '0.65rem', fontWeight: 800, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(4,10,24,1)', boxShadow: '0 2px 8px rgba(34,211,238,0.5)' }}
                                        >
                                            {unreadCount}
                                        </motion.span>
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {showNotifs && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                            style={{ position: 'absolute', right: 0, top: '50px', width: '360px', background: 'rgba(8,17,38,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: '700', fontSize: '0.9rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)' }}>
                                                Notifications
                                                {unreadCount > 0 && <span style={{ fontSize: '0.7rem', color: '#000', background: 'var(--brand-cyan)', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>{unreadCount} NEW</span>}
                                            </div>
                                            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                                {notifications.length === 0 ? (
                                                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>You're all caught up.</div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', background: n.is_read ? 'transparent' : 'rgba(34, 211, 238, 0.04)', transition: 'background 0.2s', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                            {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-cyan)', marginTop: '6px', boxShadow: '0 0 8px rgba(34,211,238,0.6)', flexShrink: 0 }} />}
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '0.85rem', color: n.is_read ? 'rgba(255,255,255,0.6)' : '#fff', fontWeight: n.is_read ? 400 : 500, marginBottom: '6px', lineHeight: 1.4 }}>{n.message}</div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{new Date(n.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                                    {!n.is_read && (
                                                                        <button onClick={() => markAsRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--brand-cyan)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', opacity: 0.8 }} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.8}>Mark Read</button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div ref={profileRef} style={{ position: 'relative' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(34,211,238,0.2)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
                                    style={{ display: 'grid', placeItems: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(99,102,241,0.2))', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', overflow: 'hidden' }}
                                >
                                    <User size={18} />
                                </motion.button>

                                <AnimatePresence>
                                    {showProfile && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                            style={{ position: 'absolute', right: 0, top: '50px', width: '240px', background: 'rgba(8,17,38,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', padding: '0.5rem', overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-grad)', padding: 1 }}>
                                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(8,17,38,1)', display: 'grid', placeItems: 'center' }}>
                                                        <User size={20} color="var(--brand-cyan)" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>My Account</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Active Session</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gap: '2px' }}>
                                                <button
                                                    onClick={() => { navigate('/profile'); setShowProfile(false); }}
                                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.2s', textAlign: 'left', fontWeight: 500 }}
                                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
                                                >
                                                    <Settings size={16} color="rgba(255,255,255,0.4)" /> My Settings
                                                </button>
                                                <button
                                                    onClick={logout}
                                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', background: 'transparent', border: 'none', color: '#fca5a5', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.2s', textAlign: 'left', fontWeight: 500 }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <LogOut size={16} color="#ef4444" /> Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <NavLink to="/login" style={{ textDecoration: 'none' }}>
                                <motion.button whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }} whileTap={{ scale: 0.98 }} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '6px' }}>Log In</motion.button>
                            </NavLink>
                            <NavLink to="/register" style={{ textDecoration: 'none' }}>
                                <motion.button 
                                    whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(34,211,238,0.2)' }} 
                                    whileTap={{ scale: 0.98 }} 
                                    style={{ background: 'linear-gradient(135deg, #00E5FF, #0055FF)', border: 'none', color: '#030B18', padding: '0.4rem 1rem', fontSize: '13px', fontWeight: 700, cursor: 'pointer', borderRadius: '6px', boxShadow: '0 2px 8px rgba(34,211,238,0.15)' }}
                                >
                                    Get Started
                                </motion.button>
                            </NavLink>
                        </div>
                    )}

                    <div style={{ display: 'none' }} className="mobile-toggle"><style>{`@media(max-width: 1099px) { .mobile-toggle { display: block !important; } }`}</style>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#fff', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </motion.button>
                    </div>
                </div>

            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', background: 'rgba(4, 10, 24, 0.95)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div style={{ padding: '1.5rem', display: 'grid', gap: '0.5rem' }}>
                            {links.map(({ to, label }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    style={({ isActive }) => ({
                                        padding: '0.85rem 1rem',
                                        fontSize: '1rem',
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                                        background: isActive ? 'rgba(34,211,238,0.1)' : 'transparent',
                                        borderLeft: isActive ? '3px solid var(--brand-cyan)' : '3px solid transparent',
                                        textDecoration: 'none',
                                        borderRadius: '6px'
                                    })}
                                >
                                    {label}
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CommandPalette isOpen={showCommand} onClose={() => setShowCommand(false)} />
        </header>
    )
}

export default Header
