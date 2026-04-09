import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import api from '../services/api'
import { motion, AnimatePresence, animate, useInView } from 'framer-motion'
import { Map, Ship, Anchor, PlayCircle, BarChart3, Settings, Bell, Eye, Check, ChevronRight, Activity, Globe, Shield, Zap, ArrowUpRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function AnimatedCounter({ to, suffix = '' }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, to, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return controls.stop
  }, [to, isInView])
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>
}

const FEATURES = [
  { to: '/map',       icon: Map,        color: '#22d3ee', title: 'Live Vessel Map',   desc: 'Real-time positions and active safety zone overlays over global oceans' },
  { to: '/vessels',  icon: Ship,       color: '#818cf8', title: 'Fleet Intelligence', desc: 'Advanced search matrix for vessels filtered by type, flag, and cargo' },
  { to: '/ports',    icon: Anchor,     color: '#34d399', title: 'Port Congestion',    desc: 'Live terminal arrivals, departures, and wait-time forecasts' },
  { to: '/voyages',  icon: PlayCircle, color: '#f87171', title: 'Voyage Replay',      desc: 'Kinematic playback of historical shipping routes with waypoint events' },
  { to: '/analytics',icon: BarChart3,  color: '#fbbf24', title: 'Global Analytics',   desc: 'Aggregated industry metrics, trends, and executive KPIs' },
  { to: '/admin',    icon: Shield,     color: '#a78bfa', title: 'System Admin',       desc: 'Endpoint health, safety event broadcasts, and system rapid-links' },
]

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } }
}
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

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
    } catch { /* ignore */ }
  }

  const KPI_DATA = [
    { label: 'Active Vessels',  value: dashboardData?.active_vessels_count || 0, icon: Ship,     color: '#22d3ee', bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.2)' },
    { label: 'Delayed Vessels',  value: dashboardData?.delayed_vessels || 0,      icon: Anchor,   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
    { label: 'Risk Alerts',      value: dashboardData?.risk_alerts_count || 0,    icon: Bell,     color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)' },
    { label: 'System Health',    value: dashboardData?.system_health || 100,      icon: Activity, color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)', suffix: '%' },
  ]

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      style={{ display: 'grid', gap: '2.5rem', paddingBottom: '3rem' }}
    >
      {/* ── Welcome Header ── */}
      <motion.div
        variants={cardVariants}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.75rem', position: 'relative', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div style={{ position: 'absolute', top: -60, left: -20, width: 400, height: 200, background: 'radial-gradient(ellipse at top left, rgba(34,211,238,0.12), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 99, padding: '0.25rem 0.85rem', marginBottom: '0.75rem' }}>
            <span className="status-dot status-dot--online" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>All Systems Nominal</span>
          </div>
          <h1 className="text-h1" style={{ color: '#fff', marginBottom: '0.5rem' }}>
            Welcome back, <span className="gradient-text">{user?.username || 'Operator'}</span>.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: 400, maxWidth: 520 }}>
            Your maritime command center is live. All global AIS feeds and intelligence streams are active.
          </p>
        </div>

        <Link to="/profile" style={{ textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          <motion.button
            whileHover={{ y: -2, background: 'rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
            whileTap={{ scale: 0.96 }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.7rem 1.4rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.25s' }}
          >
            <Settings size={15} /> Edit Profile <ArrowUpRight size={14} style={{ opacity: 0.5 }} />
          </motion.button>
        </Link>
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1.25rem' }}>
        {KPI_DATA.map((kpi, i) => (
          <motion.div key={i} variants={cardVariants} className="kpi-card" style={{ '--accent-color': kpi.color }}>
            {/* Ambient background glow per card */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 160, height: 160, background: `radial-gradient(circle at top right, ${kpi.bg}, transparent 65%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>{kpi.label}</div>
                <div className="text-display-2" style={{ color: '#fff' }}>
                  <AnimatedCounter to={kpi.value} suffix={kpi.suffix || ''} />
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: kpi.bg, border: `1px solid ${kpi.border}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Port Analytics Preview ── */}
      {portData && (
        <motion.div variants={cardVariants} className="card" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), rgba(99,102,241,0.5), transparent)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 className="text-h3" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Globe size={18} color="#22d3ee" /> Global Port Analytics
            </h2>
            <Link to="/ports" style={{ fontSize: '0.8rem', color: '#22d3ee', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.8}>
              View Full Report <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', minWidth: 220 }}>
              {[
                { label: 'Avg Delay', value: `${portData.avg_wait_time}h`, hint: 'in port wait time' },
                { label: 'Congestion', value: portData.congestion_score, hint: 'global score', warn: portData.congestion_score > 60 },
                { label: 'Arrivals', value: portData.arrivals, hint: 'scheduled today' },
                { label: 'Departures', value: portData.departures, hint: 'cleared today' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '0.9rem 1rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.4rem' }}>{item.label}</div>
                  <div className="text-h3" style={{ color: item.warn ? '#ef4444' : '#fff' }}>{item.value}</div>
                  <div style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{item.hint}</div>
                </div>
              ))}
            </div>

            <div style={{ height: '160px', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Arrivals', count: portData.arrivals }, { name: 'Departures', count: portData.departures }]} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={85} stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: '#081126', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '0.8rem' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                    <Cell fill="url(#barGrad1)" />
                    <Cell fill="url(#barGrad2)" />
                  </Bar>
                  <defs>
                    <linearGradient id="barGrad1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                    <linearGradient id="barGrad2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Feature Cards Matrix ── */}
      <div>
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-subheading" style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Zap size={16} color="#fbbf24" /> Intelligence Modules
          </h2>
        </div>
        <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(17.5rem, 1fr))', gap: '1rem' }}>
          {FEATURES.map((f) => (
            <Link key={f.to} to={f.to} style={{ textDecoration: 'none' }}>
              <motion.div
                variants={cardVariants}
                className="card"
                whileHover={{ y: -6, borderColor: `${f.color}40` }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', cursor: 'pointer' }}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: `radial-gradient(circle at top right, ${f.color}12, transparent 65%)`, filter: 'blur(16px)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <motion.div
                    whileHover={{ scale: 1.1, boxShadow: `0 8px 24px ${f.color}40` }}
                    style={{ width: 46, height: 46, borderRadius: '13px', background: `linear-gradient(135deg, ${f.color}20, ${f.color}08)`, color: f.color, display: 'grid', placeItems: 'center', border: `1px solid ${f.color}35`, transition: 'all 0.2s' }}
                  >
                    <f.icon size={20} />
                  </motion.div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '50%', padding: '0.4rem', transition: 'background 0.2s' }}>
                    <ChevronRight size={16} color="rgba(255,255,255,0.35)" />
                  </div>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="text-h3" style={{ color: '#fff', marginBottom: '0.4rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>

                <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
                  <div style={{ height: '1px', background: `linear-gradient(90deg, ${f.color}30, transparent)` }} />
                  <span style={{ fontSize: '0.72rem', color: f.color, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.6rem', opacity: 0.8 }}>
                    Open module <ArrowUpRight size={11} />
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* ── Bottom Row: Intelligence Feed + Monitored Assets ── */}
      <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* Intelligence Feed */}
        <motion.div variants={cardVariants} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), rgba(34,211,238,0.5), transparent)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            <h2 className="text-h3" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Bell size={18} color="#22d3ee" style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.5))' }} />
              Intelligence Feed
              {unread.length > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', padding: '2px 8px', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 800, marginLeft: '0.25rem' }}>
                  {unread.length} NEW
                </motion.span>
              )}
            </h2>
          </div>

          {loadingNotifs ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2.5rem 0', color: '#22d3ee', fontSize: '0.85rem' }}>
              <div style={{ width: 24, height: 24, border: '2px solid rgba(34,211,238,0.2)', borderTopColor: '#22d3ee', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Decrypting signals...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', padding: '2.5rem 0', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.07)' }}>
              No priority alerts in sector.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.6rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {notifications.slice(0, 15).map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                    opacity: n.is_read ? 0.55 : 1,
                    background: n.is_read ? 'rgba(255,255,255,0.01)' : 'linear-gradient(90deg, rgba(34,211,238,0.08), rgba(34,211,238,0.01))',
                    borderRadius: '10px', padding: '0.85rem 1rem',
                    borderLeft: n.is_read ? '2px solid rgba(255,255,255,0.06)' : '2px solid #22d3ee',
                    transition: 'all 0.25s'
                  }}
                >
                  {!n.is_read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee', flexShrink: 0, marginTop: 6 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: n.is_read ? 400 : 500, color: n.is_read ? 'rgba(255,255,255,0.5)' : '#fff', lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.35rem' }}>
                      {new Date(n.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => markRead(n.id)}
                      title="Acknowledge"
                      style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee', borderRadius: '8px', padding: '0.35rem', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.2)' }}
                      onMouseOut={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.08)' }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Monitored Assets */}
        <motion.div variants={cardVariants} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            <h2 className="text-h3" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Eye size={18} color="#6366f1" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }} />
              Monitored Assets
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{subscriptions.length} vessel{subscriptions.length !== 1 ? 's' : ''}</span>
          </div>

          {loadingNotifs ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2.5rem 0', color: '#6366f1', fontSize: '0.85rem' }}>
              <div style={{ width: 24, height: 24, border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Connecting to satellites...
            </div>
          ) : subscriptions.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', padding: '2.5rem 1rem', textAlign: 'center', lineHeight: 1.7, background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.07)' }}>
              No assets tracked.<br />
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Visit a vessel to initialize real-time tracking.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {subscriptions.map(sub => (
                <Link key={sub.id} to={`/vessels/${sub.vessel?.id || ''}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ x: 4, borderColor: 'rgba(99,102,241,0.35)', background: 'linear-gradient(90deg, rgba(99,102,241,0.08), rgba(255,255,255,0.02))' }}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.25s' }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', letterSpacing: '0.01em' }}>{sub.vessel?.name || 'Unknown Asset'}</div>
                      <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                        IMO {sub.vessel?.imo_number} · <span style={{ color: '#818cf8' }}>{sub.vessel?.vessel_type}</span>
                      </div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)', padding: '0.25rem 0.7rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.07em' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#818cf8', animation: 'ping 2s infinite' }} /> ACTIVE
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

