import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchExtraProfile, updateExtraProfile } from '../services/authService'

const API_BASE = 'http://127.0.0.1:8000'

export default function UpdateProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ company: '', phone_number: '', bio: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    fetchExtraProfile()
      .then(data => {
        setForm({
          company: data.company || '',
          phone_number: data.phone_number || '',
          bio: data.bio || '',
        })
        if (data.avatar && data.avatar !== '' && !data.avatar.includes('null')) {
          const url = data.avatar.startsWith('http') ? data.avatar : `${API_BASE}${data.avatar}`
          setAvatarPreview(url)
        }
      })
      .catch((err) => {
        console.error('Failed to load profile data:', err)
        setError('Failed to load profile data.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAvatarChange = e => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    const fd = new FormData()
    fd.append('company', form.company || '')
    fd.append('phone_number', form.phone_number || '')
    fd.append('bio', form.bio || '')
    if (avatarFile) {
      fd.append('avatar', avatarFile)
    }
    try {
      const response = await updateExtraProfile(fd)
      // Update avatar preview with the new URL from the response
      if (response.avatar && !response.avatar.endsWith('default.png')) {
        const url = response.avatar.startsWith('http') ? response.avatar : `${API_BASE}${response.avatar}`
        setAvatarPreview(url)
      }
      setSaved(true)
      setTimeout(() => navigate('/profile'), 1500)
    } catch (err) {
      console.error('Profile update error:', err)
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.error ||
                       Object.values(err.response?.data || {}).flat().join(', ') ||
                       err.message ||
                       'Failed to save changes. Please try again.'
      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--brand)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  )

  const initials = 'ME'

  return (
    <motion.div 
      style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem' }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '.25rem', color: '#fff' }}>Edit Profile</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '.9rem', marginBottom: '2rem' }}>Update your personal information and profile photo.</p>

        <form onSubmit={handleSubmit}>
          {/* â”€â”€ Avatar picker â”€â”€ */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 110, height: 110, borderRadius: '50%',
                background: avatarPreview ? 'transparent' : 'var(--bg-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 700, color: 'var(--text-1)',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.1)',
                transition: 'border-color .2s',
              }}
              title="Click to change avatar"
              className="avatar-container"
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : initials
              }
              {/* camera overlay */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity .2s',
              }}
                className="avatar-overlay"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                <span style={{ fontSize: '.65rem', color: '#fff', marginTop: 4, fontWeight: 600, letterSpacing: '0.05em' }}>CHANGE</span>
              </div>
            </div>
            <p style={{ fontSize: '.78rem', color: 'var(--text-2)', marginTop: '.8rem' }}>Click avatar to upload a new photo (JPG, PNG — max 5 MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            {avatarFile && (
              <span style={{ fontSize: '.78rem', color: 'var(--brand-cyan)', marginTop: '.4rem', fontWeight: 500 }}>
                {avatarFile.name} selected
              </span>
            )}
          </div>

          {/* â”€â”€ Fields â”€â”€ */}
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div className="field">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g. Global Maritime Corp"
                autoComplete="organization"
              />
            </div>

            <div className="field">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                id="phone_number"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="+1 555 000 0000"
                autoComplete="tel"
              />
            </div>

            <div className="field">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us a bit about yourself..."
                style={{
                  resize: 'vertical', fontFamily: 'inherit', fontSize: '0.95rem',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-0)',
                  padding: '.65rem .9rem', width: '100%', boxSizing: 'border-box',
                  transition: 'border-color .2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand-cyan)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* â”€â”€ Feedback â”€â”€ */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5',
              borderRadius: 'var(--radius-sm)', padding: '.7rem 1rem', fontSize: '.87rem', marginTop: '1.25rem'
            }}>
              {error}
            </div>
          )}
          {saved && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#86efac',
              borderRadius: 'var(--radius-sm)', padding: '.7rem 1rem', fontSize: '.87rem', marginTop: '1.25rem'
            }}>
              Profile saved! Redirecting...
            </div>
          )}

          {/* â”€â”€ Actions â”€â”€ */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button type="submit" className="btn btn--primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/profile')} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .avatar-container:hover { border-color: rgba(255,255,255,0.3) !important; }
        .avatar-overlay { pointer-events: none; }
        .avatar-container:hover .avatar-overlay { opacity: 1 !important; }
      `}</style>
    </motion.div>
  )
}

