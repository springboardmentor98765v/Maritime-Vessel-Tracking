import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProfile } from '../services/authService'

export default function ProfilePage() {
  const [data, setData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
      .then(res => setData(res))
      .catch(err => {
        console.error('Profile fetch failed:', err)
        setData({
          username: 'Guest User',
          email: 'Not logged in',
          role: 'guest',
          profile: { bio: 'Please log in to edit your profile and preferences.' }
        })
      })
  }, [])

  if (!data) {
    return <div className="detail-loading">Loading profile…</div>
  }

  const profile = data.profile || {}
  const initials = (data.username || 'U').slice(0, 2).toUpperCase()
  const avatarSrc = profile.avatar ? `http://127.0.0.1:8000${profile.avatar}` : null

  return (
    <div className="profile-page">
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
