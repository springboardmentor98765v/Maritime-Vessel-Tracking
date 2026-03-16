import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ username: '', password: '', role: 'operator' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

  const renderToggleBtn = (visible, toggleFn, label) => (
    <button
      type="button"
      onClick={toggleFn}
      style={{
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280'
      }}
      aria-label={visible ? `Hide ${label}` : `Show ${label}`}
    >
      {visible ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 013.153-4.278M6.1 6.1L17.9 17.9" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  )

   return (
    <motion.div 
      className="auth-wrapper"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Info panel */}
      <div className="auth-info">
        <h2>Welcome back to<br />Maritime Vista</h2>
        <p>Sign in to access your maritime intelligence dashboard — vessel tracking, port analytics, and safety overlays in one view.</p>

        <div className="auth-feature">
          <div className="auth-feature-icon auth-feature-icon--vessel">VT</div>
          <div>Real-time vessel positions and event history</div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon auth-feature-icon--port">PA</div>
          <div>Port congestion scores and wait times</div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon auth-feature-icon--safety">SA</div>
          <div>Safety overlays: storms, piracy, restricted zones</div>
        </div>
      </div>

      {/* Auth card */}
      <div className="auth-card">
        <div className="auth-card__header">
          <h2 className="auth-card__title">Sign in</h2>
          <p className="auth-card__sub">Access your maritime command center</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
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
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              {renderToggleBtn(showPassword, () => setShowPassword(s => !s), 'password')}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn--primary btn--full" disabled={loading} style={{ marginTop: '0.25rem' }}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="auth-footer-link" style={{ marginTop: '1.5rem' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one free</Link>
          <span style={{ margin: '0 0.5rem', color: 'var(--text-3)' }}>·</span>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </motion.div>
  )
}
