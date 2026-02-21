import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')
    setLoading(true)
    try {
      await api.post('/auth/password-reset/', { email })
      setStatus("If that email exists, we'll send password reset instructions.")
      setEmail('')
      // Optionally navigate back to login after a short delay
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError('Unable to send reset instructions. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card__header">
          <h2 className="auth-card__title">Reset password</h2>
          <p className="auth-card__sub">Enter your account email to receive reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {error && <div className="form-error">{error}</div>}
          {status && <div className="form-success">{status}</div>}

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <Link to="/login" className="btn btn--ghost">Back to sign in</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
