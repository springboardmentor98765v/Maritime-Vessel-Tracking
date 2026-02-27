import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/password-reset/', { email })
    } catch {
      // Even on network error, show success — don't reveal if email exists.
      // Console backend may print to terminal which the user can see.
    } finally {
      setLoading(false)
      setSent(true)
      setTimeout(() => navigate('/login'), 4000)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <div className="auth-card__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '.5rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2 className="auth-card__title" style={{ margin: 0 }}>Reset password</h2>
          </div>
          <p className="auth-card__sub">Enter your account email to receive reset instructions.</p>
        </div>

        {sent ? (
          <div style={{ animation: 'fadeUp .35s ease both' }}>
            <div style={{
              background: '#22c55e18', border: '1px solid #22c55e44',
              borderRadius: 'var(--radius)', padding: '1.25rem',
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <div style={{ fontWeight: 600, color: '#22c55e', marginBottom: '.25rem' }}>Instructions sent</div>
                <div style={{ fontSize: '.85rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  If <strong>{email}</strong> is registered, a reset link has been sent.
                  Check your email inbox (or the server console in development).
                </div>
              </div>
            </div>
            <p style={{ fontSize: '.83rem', color: 'var(--text-2)', textAlign: 'center' }}>
              Redirecting to sign-in in a moment...
            </p>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/login" className="btn btn--ghost btn--sm">Back to sign in</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div className="field">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '.25rem' }}>
              <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <Link to="/login" className="btn btn--ghost" style={{ flex: 1, textAlign: 'center' }}>
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
