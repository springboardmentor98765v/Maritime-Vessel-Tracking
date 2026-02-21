import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const features = [
  { icon: '🗺️', title: 'Live Vessel Map', detail: 'Real-time positions for all tracked vessels.' },
  { icon: '⚓', title: 'Port Congestion', detail: 'Berth availability, dwell times & arrival queues.' },
  { icon: '🛡️', title: 'Safety Overlays', detail: 'Storms, piracy zones and incident alerts on the map.' },
]

function DashboardPage() {
  const { authState } = useAuth()
  const profile = authState?.profile || {}

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__greeting">
            Welcome back, {profile.username || 'User'} 👋
          </h1>
          <p className="dashboard__sub">
            Role: <strong>{profile.role || '—'}</strong> · Maritime Vista Command Center
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <NavLink to="/vessels" className="btn btn--ghost btn--sm">Browse Vessels</NavLink>
          <NavLink to="/map" className="btn btn--primary btn--sm">Live Map →</NavLink>
        </div>
      </div>

      {/* Quick nav cards */}
      <div className="dashboard__grid">
        {/* Profile summary */}
        <div className="dash-card">
          <div className="dash-card__icon">👤</div>
          <div className="dash-card__title">{profile.username || '—'}</div>
          <div className="dash-card__detail">
            Role: {profile.role || '—'}<br />
            Email: {profile.email || '—'}
          </div>
          <NavLink to="/profile" className="btn btn--ghost btn--sm" style={{ marginTop: '.5rem', width: 'fit-content' }}>
            View profile
          </NavLink>
        </div>

        {features.map(({ icon, title, detail }) => (
          <div key={title} className="dash-card">
            <div className="dash-card__icon">{icon}</div>
            <div className="dash-card__title">{title}</div>
            <div className="dash-card__detail">{detail}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="card card--glow" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.25rem' }}>Ready to explore?</h3>
          <p className="text-muted" style={{ fontSize: '.85rem' }}>Navigate to any section using the links below.</p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <NavLink to="/map" className="btn btn--ghost btn--sm">🗺️ Map</NavLink>
          <NavLink to="/vessels" className="btn btn--ghost btn--sm">🚢 Vessels</NavLink>
          <NavLink to="/ports" className="btn btn--ghost btn--sm">⚓ Ports</NavLink>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
