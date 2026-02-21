import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ username: '', password: '', role: 'operator' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch {
      setError('Invalid username, password, or role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      {/* Info panel */}
      <div className="auth-info">
        <h2>Welcome back to<br />Maritime Vista</h2>
        <p>Sign in to access your maritime intelligence dashboard — vessel tracking, port analytics, and safety overlays in one view.</p>

        <div className="auth-feature">
          <div className="auth-feature-icon">🚢</div>
          <div>Real-time vessel positions and event history</div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon">⚓</div>
          <div>Port congestion scores and wait times</div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon">🛡️</div>
          <div>Safety overlays: storms, piracy, restricted zones</div>
        </div>
      </div>

      {/* Auth card */}
      <div className="auth-card">
        <div className="auth-card__header">
          <h2 className="auth-card__title">Sign in</h2>
          <p className="auth-card__sub">Access your maritime command center</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange} required>
              <option value="operator">Operator</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="auth-footer-link">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one free</Link>
            <span style={{ margin: '0 0.5rem' }}>·</span>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
      </div>
    </div>
  )
}
