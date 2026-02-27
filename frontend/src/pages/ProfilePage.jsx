import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchProfile } from '../services/authService'

export default function ProfilePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
      .then(res => { setData(res); setLoading(false) })
      .catch(err => {
        console.error('Profile fetch failed:', err)
        setError(err?.response?.status === 401 ? 'unauthenticated' : 'error')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="detail-loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--brand)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Loading profile...
        </div>
      </div>
    )
  }

  if (error === 'unauthenticated') {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', textAlign: 'center', gap: '1rem', animation: 'fadeUp .38s ease both' }}>
        <div>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '.5rem' }}>Sign in to view your profile</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '1.5rem' }}>Your profile, subscriptions, and notifications are available after signing in.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn--primary">Sign In</Link>
            <Link to="/register" className="btn btn--ghost">Create Account</Link>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh', textAlign: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-2)', marginBottom: '1rem' }}>Failed to load profile. The server may be unavailable.</p>
          <button className="btn btn--ghost" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  const profile = data.profile || {}
  const initials = (data.username || 'U').slice(0, 2).toUpperCase()
  const avatarSrc = profile.avatar ? `http://127.0.0.1:8000${profile.avatar}` : null

  return (
    <div className="profile-page" style={{ animation: 'fadeUp .38s ease both' }}>
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {avatarSrc ? <img src={avatarSrc} alt="Avatar" /> : initials}
        </div>
        <div>
          <div className="profile-name">{data.username}</div>
          <div className="profile-role">
            <span className="badge badge--blue">{data.role || 'user'}</span>
          </div>
          <div style={{ fontSize: '.83rem', color: 'var(--text-2)', marginTop: '.4rem' }}>{data.email}</div>
        </div>
      </div>

      {/* Profile details card */}
      <div className="card">
        <div className="profile-section">
          <h3>Account details</h3>
          <div className="profile-grid">
            <div className="vessel-detail-card">
              <div className="detail-label">Username</div>
              <div className="detail-value">{data.username}</div>
            </div>
            <div className="vessel-detail-card">
              <div className="detail-label">Email</div>
              <div className="detail-value">{data.email}</div>
            </div>
            {profile.company && (
              <div className="vessel-detail-card">
                <div className="detail-label">Company</div>
                <div className="detail-value">{profile.company}</div>
              </div>
            )}
            {profile.phone_number && (
              <div className="vessel-detail-card">
                <div className="detail-label">Phone</div>
                <div className="detail-value">{profile.phone_number}</div>
              </div>
            )}
          </div>

          {profile.bio && (
            <div style={{ marginTop: '.75rem' }}>
              <div className="detail-label">Bio</div>
              <p style={{ marginTop: '.3rem', lineHeight: 1.6 }}>{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '.85rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate('/profile/update')}
          >
            Edit profile
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate('/profile/change-password')}
          >
            Change password
          </button>
        </div>
      </div>
    </div>
  )
}
