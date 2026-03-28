import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchProfile } from '../services/authService'

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVars = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

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
          <div style={{ width: 36, height: 36, border: '3px solid var(--brand-cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Loading profile...
        </div>
      </div>
    )
  }

  if (error === 'unauthenticated') {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', textAlign: 'center', gap: '1rem', animation: 'fadeUp .38s ease both' }}>
        <div>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '.5rem', color: '#fff' }}>Sign in to view your profile</h2>
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

  // Build avatar URL — use backend media if available, else show initials
  let avatarSrc = null
  if (profile.avatar && !profile.avatar.endsWith('default.png')) {
    avatarSrc = profile.avatar.startsWith('http')
      ? profile.avatar
      : `http://127.0.0.1:8000${profile.avatar}`
  }

  return (
    <motion.div 
      className="profile-page" 
      variants={containerVars}
      initial="hidden"
      animate="show"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}
    >
      {/* Header */}
      <motion.div className="profile-header" variants={itemVars} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Clickable avatar — opens the edit page */}
        <div
          style={{ position: 'relative', cursor: 'pointer', width: 96, height: 96, borderRadius: '50%', background: 'var(--bg-3)', border: '2px solid rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', fontSize: '2rem', fontWeight: 700, overflow: 'hidden', flexShrink: 0 }}
          onClick={() => navigate('/profile/update')}
          title="Edit avatar"
          className="avatar-container"
        >
          {avatarSrc
            ? <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'var(--text-2)' }}>{initials}</span>
          }
          {/* camera hover overlay */}
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity .2s',
          }} className="avatar-cam-overlay">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span style={{ fontSize: '.7rem', color: '#fff', marginTop: 4, fontWeight: 600, letterSpacing: '0.05em' }}>EDIT</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: '0.5rem' }}>{data.username}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(34,211,238,0.15)', color: 'var(--brand-cyan)', border: '1px solid rgba(34,211,238,0.3)' }}>
              {data.role || 'operator'}
            </span>
            <span style={{ fontSize: '.9rem', color: 'var(--text-2)' }}>{data.email}</span>
          </div>
        </div>
      </motion.div>

      <style>{`.avatar-container:hover .avatar-cam-overlay { opacity: 1 !important; }`}</style>

      {/* Profile details card */}
      <motion.div className="card" variants={itemVars}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Account Details</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
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
          <div className="vessel-detail-card" style={{ marginTop: '1rem' }}>
            <div className="detail-label">Bio</div>
            <p style={{ marginTop: '.3rem', lineHeight: 1.6, color: 'var(--text-1)', fontSize: '0.9rem' }}>{profile.bio}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
          <motion.button
            whileHover={{ scale: 1.02, y: -2, boxShadow: '0 8px 24px rgba(34,211,238,0.25)' }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="btn btn--primary"
            onClick={() => navigate('/profile/update')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontWeight: 600, borderRadius: '10px' }}
          >
            Edit Profile
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -2, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate('/profile/change-password')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontWeight: 600, borderRadius: '10px' }}
          >
            Change Password
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
