import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import api from '../services/api'

const FEATURES = [
  { to: '/map', icon: 'MAP', title: 'Live Vessel Map', desc: 'Real-time positions and safety overlays' },
  { to: '/vessels', icon: 'FLEET', title: 'Fleet Search', desc: 'Filter vessels by type, flag, cargo' },
  { to: '/ports', icon: 'PORTS', title: 'Port Congestion', desc: 'Arrivals, departures, wait times' },
  { to: '/voyages', icon: 'REPLAY', title: 'Voyage Replay', desc: 'Animate historical voyage routes' },
  { to: '/analytics', icon: 'STATS', title: 'Analytics', desc: 'Charts, trends, and KPIs' },
  { to: '/admin', icon: 'ADMIN', title: 'Admin Tools', desc: 'API status, safety events, quick links' },
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

  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__greeting">
            Welcome back{user?.username ? `, ${user.username}` : ''}.
          </h1>
          <p className="dashboard__sub">Your maritime command center — everything in one place.</p>
        </div>
        <Link to="/profile" className="btn btn--ghost btn--sm">Edit Profile</Link>
      </div>

      {/* Feature cards grid */}
      <div className="dashboard__grid">
        {FEATURES.map(f => (
          <Link key={f.to} to={f.to} className="dash-card" style={{ textDecoration: 'none' }}>
            <div className="dash-card__icon" style={{ fontSize: '.65rem', letterSpacing: '.05em', fontWeight: 800, color: 'var(--brand)' }}>{f.icon}</div>
            <div className="dash-card__title">{f.title}</div>
            <div className="dash-card__detail">{f.desc}</div>
          </Link>
        ))}
      </div>

      {/* Bottom row: notifications + subscriptions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>

        {/* Notifications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.85rem' }}>
            <h2 style={{ fontSize: '.95rem', fontWeight: 700 }}>
              Notifications
              {unread.length > 0 && <span className="badge badge--red" style={{ marginLeft: '.5rem' }}>{unread.length}</span>}
            </h2>
          </div>
          {loadingNotifs ? (
            <div style={{ color: 'var(--text-2)', fontSize: '.8rem' }}>Loading…</div>
          ) : notifications.length === 0 ? (
            <div style={{ color: 'var(--text-2)', fontSize: '.8rem' }}>No notifications yet. Subscribe to a vessel to receive alerts.</div>
          ) : (
            <div style={{ display: 'grid', gap: '.6rem', maxHeight: 260, overflowY: 'auto' }}>
              {notifications.slice(0, 15).map(n => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '.65rem',
                    opacity: n.is_read ? 0.55 : 1,
                    background: n.is_read ? 'transparent' : 'rgba(34,211,238,.04)',
                    borderRadius: 8, padding: '.55rem .65rem',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.8rem', fontWeight: n.is_read ? 400 : 600, lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-2)', marginTop: '.15rem' }}>
                      {new Date(n.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {!n.is_read && (
                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ flexShrink: 0, fontSize: '.68rem', padding: '.2rem .5rem' }}
                      onClick={() => markRead(n.id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscribed vessels */}
        <div className="card">
          <h2 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: '.85rem' }}>Subscribed Vessels</h2>
          {loadingNotifs ? (
            <div style={{ color: 'var(--text-2)', fontSize: '.8rem' }}>Loading…</div>
          ) : subscriptions.length === 0 ? (
            <div style={{ color: 'var(--text-2)', fontSize: '.8rem' }}>
              No subscriptions yet. Visit a vessel detail page and click "Subscribe to Alerts".
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '.55rem' }}>
              {subscriptions.map(sub => (
                <Link
                  key={sub.id}
                  to={`/vessels/${sub.vessel?.id || ''}`}
                  className="sub-item"
                  style={{ textDecoration: 'none' }}
                >
                  <div>
                    <div className="sub-item__name">{sub.vessel?.name || 'Unknown Vessel'}</div>
                    <div className="sub-item__meta">IMO: {sub.vessel?.imo_number} · {sub.vessel?.vessel_type}</div>
                  </div>
                  <span className="badge badge--blue">Watching</span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
