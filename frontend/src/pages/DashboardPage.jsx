import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import api from '../services/api'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { Map, Ship, Anchor, PlayCircle, BarChart3, Settings, Bell, Eye, Check, ChevronRight, Activity, Globe } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function AnimatedCounter({ to }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const controls = animate(0, to, { duration: 1.5, ease: "easeOut", onUpdate: (v) => setValue(Math.round(v)) })
    return controls.stop
  }, [to])
  return <span>{value.toLocaleString()}</span>
}

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

  const [dashboardData, setDashboardData] = useState(null)
  const [portData, setPortData] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/notifications/').then(r => r.data).catch(() => []),
      api.get('/vessels/subscriptions/').then(r => r.data).catch(() => []),
      api.get('/api/dashboard/company/').then(r => r.data).catch(() => null),
      api.get('/api/dashboard/port/').then(r => r.data).catch(() => null),
    ]).then(([n, s, d, p]) => {
      setNotifications(n)
      setSubscriptions(s)
      setDashboardData(d || { active_vessels_count: 0, delayed_vessels: 0, risk_alerts_count: 0, system_health: 100 })
      setPortData(p || { congestion_score: 0, arrivals: 0, departures: 0, avg_wait_time: 0 })
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
      <motion.div variants={itemVariants} className="dashboard__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-hi)', paddingBottom: '1.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-50px', left: 0, width: '300px', height: '100px', background: 'radial-gradient(ellipse at top left, rgba(34,211,238,0.15), transparent 70%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif' }}>
            Welcome back{user?.username ? `, ${user.username}` : ''}.
          </h1>
          <p style={{ color: 'var(--text-1)', fontSize: '1rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 500 }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', boxShadow: '0 0 12px rgba(16,185,129,0.8)' }} />
            Secure connection established. Mission systems nominal.
          </p>
        </div>
        <Link to="/profile" style={{ textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          <motion.button 
            whileHover={{ y: -2, background: 'rgba(255,255,255,0.12)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}
            whileTap={{ scale: 0.95 }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-hi)', color: '#fff', padding: '0.7rem 1.4rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
          >
            <Settings size={16} /> Edit Profile
          </motion.button>
        </Link>
      </motion.div>

      {/* KPI Row */}
      <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Active Vessels', value: dashboardData?.active_vessels_count || 0, icon: <Ship size={20} color="var(--brand-primary)" />, accent: 'var(--brand-primary)' },
          { label: 'Delayed Vessels', value: dashboardData?.delayed_vessels || 0, icon: <Anchor size={20} color="var(--brand-accent)" />, accent: 'var(--brand-accent)' },
          { label: 'Risk Alerts', value: dashboardData?.risk_alerts_count || 0, icon: <Bell size={20} color="var(--warning)" />, accent: 'var(--warning)' },
          { label: 'System Health', value: dashboardData?.system_health || 100, suffix: '%', icon: <Activity size={20} color="var(--success)" />, accent: 'var(--success)' },
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: `linear-gradient(135deg, ${kpi.accent}15, ${kpi.accent}05)`, border: `1px solid ${kpi.accent}30` }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: '"Space Grotesk", sans-serif', color: '#fff', lineHeight: 1 }}>
                <AnimatedCounter to={kpi.value} />{kpi.suffix}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-1)', marginTop: '0.2rem' }}>{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Port Analytics Preview */}
      {portData && (
        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-hi)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"Space Grotesk", sans-serif' }}>
              <Globe size={18} color="var(--brand-cyan)" /> Global Port Analytics
            </h2>
            <Link to="/ports" style={{ fontSize: '0.8rem', color: 'var(--brand-cyan)', textDecoration: 'none', fontWeight: 600 }}>View Full Report →</Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Avg Delay</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{portData.avg_wait_time} <span style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>hrs</span></div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Congestion</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: portData.congestion_score > 60 ? '#ef4444' : '#34d399' }}>{portData.congestion_score}</div>
              </div>
            </div>

            <div style={{ height: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Arrivals', count: portData.arrivals }, { name: 'Departures', count: portData.departures }]} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={80} stroke="var(--text-2)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: '#081126', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                    <Cell fill="#38bdf8" />
                    <Cell fill="#8b5cf6" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feature cards matrix */}
      <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} style={{ textDecoration: 'none' }}>
            <motion.div 
              variants={itemVariants}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: `radial-gradient(circle at top right, ${f.color}15, transparent 70%)`, filter: 'blur(30px)', pointerEvents: 'none' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${f.color}20, ${f.color}10)`, color: f.color, display: 'grid', placeItems: 'center', border: `1px solid ${f.color}40`, boxShadow: `0 4px 12px ${f.color}20` }}>
                  {f.icon}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '0.4rem' }}>
                  <ChevronRight size={18} color="var(--text-1)" />
                </div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, marginTop: '0.5rem' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', marginBottom: '0.4rem', letterSpacing: '0.01em' }}>{f.title}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-1)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Bottom row: notifications + subscriptions */}
      <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* Intelligence Feed (Notifications) */}
        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-hi)', paddingBottom: '1.2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: '"Space Grotesk", sans-serif' }}>
              <Bell size={20} color="var(--brand-cyan)" style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.5))' }} /> Intelligence Feed
              {unread.length > 0 && <span style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: '1px solid #f87171', padding: '2px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, marginLeft: '0.75rem', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }}>{unread.length} NEW</span>}
            </h2>
          </div>
          
          {loadingNotifs ? (
            <div style={{ color: 'var(--brand-cyan)', fontSize: '0.9rem', padding: '3rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid rgba(34,211,238,0.3)', borderTopColor: 'var(--brand-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Decrypting signals...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ color: 'var(--text-2)', fontSize: '0.9rem', padding: '3rem 0', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>No priority alerts in sector.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.85rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {notifications.slice(0, 15).map(n => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    opacity: n.is_read ? 0.65 : 1,
                    background: n.is_read ? 'rgba(255,255,255,0.02)' : 'linear-gradient(90deg, rgba(34,211,238,0.1), rgba(34,211,238,0.02))',
                    borderRadius: '12px', padding: '1rem 1.25rem',
                    borderLeft: n.is_read ? '3px solid var(--border)' : '3px solid var(--brand-cyan)',
                    boxShadow: n.is_read ? 'none' : '0 4px 12px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: n.is_read ? 400 : 500, color: n.is_read ? 'var(--text-1)' : '#fff', lineHeight: 1.6 }}>{n.message}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.5rem', letterSpacing: '0.05em', fontFamily: '"Space Grotesk", sans-serif' }}>
                      {new Date(n.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  {!n.is_read && (
                    <button
                      style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)', color: 'var(--brand-cyan)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(34,211,238,0.2)' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-cyan)'; e.currentTarget.style.color = '#000'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(34,211,238,0.15)'; e.currentTarget.style.color = 'var(--brand-cyan)'; }}
                      onClick={() => markRead(n.id)}
                      title="Acknowledge"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Monitored Assets (Subscriptions) */}
        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-hi)', paddingBottom: '1.2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: '"Space Grotesk", sans-serif' }}>
              <Eye size={20} color="var(--brand-indigo)" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }} /> Monitored Assets
            </h2>
          </div>
          
          {loadingNotifs ? (
            <div style={{ color: 'var(--brand-indigo)', fontSize: '0.9rem', padding: '3rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid rgba(99,102,241,0.3)', borderTopColor: 'var(--brand-indigo)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Connecting to satellites...
            </div>
          ) : subscriptions.length === 0 ? (
            <div style={{ color: 'var(--text-2)', fontSize: '0.9rem', padding: '3rem 0', textAlign: 'center', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              No assets tracked.<br/>Visit a vessel's telemetry page to initialize tracking.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {subscriptions.map(sub => (
                <Link
                  key={sub.id}
                  to={`/vessels/${sub.vessel?.id || ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div
                    whileHover={{ x: 6, background: 'linear-gradient(90deg, rgba(99,102,241,0.1), rgba(255,255,255,0.03))', borderColor: 'rgba(99,102,241,0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' }}
                  >
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', letterSpacing: '0.01em' }}>{sub.vessel?.name || 'Unknown Asset'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-1)', marginTop: '0.25rem', fontFamily: '"Space Grotesk", sans-serif' }}>IMO {sub.vessel?.imo_number} • <span style={{ color: 'var(--brand-indigo)' }}>{sub.vessel?.vessel_type}</span></div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(99,102,241,0.2)' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'pulse 1.5s infinite', boxShadow: '0 0 8px #818cf8' }} /> ACTIVE
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
