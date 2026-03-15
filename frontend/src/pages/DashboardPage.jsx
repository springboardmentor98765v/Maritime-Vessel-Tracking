import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import api from '../services/api'
import { motion } from 'framer-motion'
import { Map, Ship, Anchor, PlayCircle, BarChart3, Settings, Bell, Eye, Check, ChevronRight } from 'lucide-react'

const FEATURES = [
  { to: '/map', icon: <Map size={22} />, color: '#22d3ee', title: 'Live Vessel Map', desc: 'Real-time positions and active safety zone overlays' },
  { to: '/vessels', icon: <Ship size={22} />, color: '#818cf8', title: 'Fleet Intelligence', desc: 'Advanced search matrix for vessels by type, flag, and cargo' },
  { to: '/ports', icon: <Anchor size={22} />, color: '#34d399', title: 'Port Congestion', desc: 'Live terminal arrivals, departures, and wait time forecasts' },
  { to: '/voyages', icon: <PlayCircle size={22} />, color: '#f87171', title: 'Voyage Replay', desc: 'Kinematic playback of historical shipping routes' },
  { to: '/analytics', icon: <BarChart3 size={22} />, color: '#fbbf24', title: 'Global Analytics', desc: 'Aggregated industry metrics, trends, and KPIs' },
  { to: '/admin', icon: <Settings size={22} />, color: '#a78bfa', title: 'System Admin', desc: 'Endpoint health, safety event broadcasts, and rapid links' },
]

export default function DashboardPage() {
  const { user } = useAuthContext()
  const [notifications, setNotifications] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loadingNotifs, setLoadingNotifs] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/notifications/').then(r => r.data).catch(() => []),
      api.get('/vessels/subscriptions/').then(r => r.data).catch(() => []),
    ]).then(([n, s]) => {
      setNotifications(n)
      setSubscriptions(s)
    }).finally(() => setLoadingNotifs(false))
  }, [])

  const unread = notifications.filter(n => !n.is_read)

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read/`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {
      // ignore
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      className="dashboard"
      initial="hidden"
      animate="show"
      variants={containerVariants}
      style={{ display: 'grid', gap: '2.5rem', paddingBottom: '2rem' }}
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="dashboard__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif' }}>
            Welcome back{user?.username ? `, ${user.username}` : ''}.
          </h1>
          <p style={{ color: 'var(--text-1)', fontSize: '0.95rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
            Secure connection established. All systems nominal.
          </p>
        </div>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <motion.button 
            whileHover={{ y: -2, background: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-hi)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Settings size={16} /> Edit Profile
          </motion.button>
        </Link>
      </motion.div>

      {/* Feature cards matrix */}
      <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} style={{ textDecoration: 'none' }}>
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, borderColor: f.color, boxShadow: `0 12px 32px ${f.color}25` }}
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', backdropFilter: 'blur(12px)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${f.color}15`, color: f.color, display: 'grid', placeItems: 'center', border: `1px solid ${f.color}30` }}>
                  {f.icon}
                </div>
                <ChevronRight size={18} color="var(--text-2)" />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', marginBottom: '0.35rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-1)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Bottom row: notifications + subscriptions */}
      <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* Intelligence Feed (Notifications) */}
        <motion.div variants={itemVariants} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"Space Grotesk", sans-serif' }}>
              <Bell size={18} color="var(--brand-cyan)" /> Intelligence Feed
              {unread.length > 0 && <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800, marginLeft: '0.5rem' }}>{unread.length} NEW</span>}
            </h2>
          </div>
          
          {loadingNotifs ? (
            <div style={{ color: 'var(--text-2)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>Decrypting signals...</div>
          ) : notifications.length === 0 ? (
            <div style={{ color: 'var(--text-2)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>No priority alerts in sector.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {notifications.slice(0, 15).map(n => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    opacity: n.is_read ? 0.6 : 1,
                    background: n.is_read ? 'transparent' : 'linear-gradient(90deg, rgba(34,211,238,0.08), transparent)',
                    borderRadius: '10px', padding: '0.85rem 1rem',
                    borderLeft: n.is_read ? '2px solid transparent' : '2px solid var(--brand-cyan)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: n.is_read ? 400 : 500, color: n.is_read ? 'var(--text-1)' : '#fff', lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', marginTop: '0.35rem', letterSpacing: '0.05em' }}>
                      {new Date(n.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  {!n.is_read && (
                    <button
                      style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', color: 'var(--brand-cyan)', borderRadius: '6px', padding: '0.35rem', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-cyan)'; e.currentTarget.style.color = '#000'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(34,211,238,0.1)'; e.currentTarget.style.color = 'var(--brand-cyan)'; }}
                      onClick={() => markRead(n.id)}
                      title="Acknowledge"
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Monitored Assets (Subscriptions) */}
        <motion.div variants={itemVariants} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"Space Grotesk", sans-serif' }}>
              <Eye size={18} color="var(--brand-indigo)" /> Monitored Assets
            </h2>
          </div>
          
          {loadingNotifs ? (
            <div style={{ color: 'var(--text-2)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>Connecting to satellites...</div>
          ) : subscriptions.length === 0 ? (
            <div style={{ color: 'var(--text-2)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center', lineHeight: 1.5 }}>
              No assets tracked.<br/>Visit a vessel's telemetry page to initialize tracking.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {subscriptions.map(sub => (
                <Link
                  key={sub.id}
                  to={`/vessels/${sub.vessel?.id || ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div
                    whileHover={{ x: 4, background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border-hi)' }}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s, border-color 0.2s' }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{sub.vessel?.name || 'Unknown Asset'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.15rem' }}>IMO: {sub.vessel?.imo_number} • {sub.vessel?.vessel_type}</div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.25rem 0.6rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'pulse 2s infinite' }} /> ACTIVE
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>
    </motion.div>
  )
}
