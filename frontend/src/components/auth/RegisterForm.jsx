import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const initialState = {
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  role: 'operator',
  password: '',
}

function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState(initialState)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      await register(form)
      setStatus('success')
      navigate('/dashboard')
    } catch (err) {
      setStatus('error')
      const apiErrors = err?.response?.data
      if (apiErrors && typeof apiErrors === 'object') {
        const messages = Object.entries(apiErrors)
          .map(([field, msgs]) => {
            const text = Array.isArray(msgs) ? msgs.join(' ') : msgs
            return field === 'non_field_errors' ? text : `${field}: ${text}`
          })
          .join(' · ')
        setError(messages || 'Registration failed. Please try again.')
      } else {
        setError('Unable to connect to the server. Is the backend running?')
      }
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <h2 className="auth-card__title">Create account</h2>
        <p className="auth-card__sub">Start tracking vessels in minutes</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.85rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div className="field">
            <label htmlFor="first_name">First name</label>
            <input id="first_name" type="text" name="first_name" placeholder="Alex"
              value={form.first_name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="last_name">Last name</label>
            <input id="last_name" type="text" name="last_name" placeholder="Morgan"
              value={form.last_name} onChange={handleChange} required />
          </div>
        </div>

        <div className="field">
          <label htmlFor="reg-username">Username</label>
          <input id="reg-username" type="text" name="username" placeholder="alexmorgan"
            value={form.username} onChange={handleChange} required autoComplete="username" />
        </div>

        <div className="field">
          <label htmlFor="email">Work email</label>
          <input id="email" type="email" name="email" placeholder="alex@maritime.com"
            value={form.email} onChange={handleChange} required autoComplete="email" />
        </div>

        <div className="field">
          <label htmlFor="reg-role">Role</label>
          <select id="reg-role" name="role" value={form.role} onChange={handleChange}>
            <option value="operator">Operator</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="reg-password">Password</label>
          <input id="reg-password" type="password" name="password" placeholder="Create a secure password"
            value={form.password} onChange={handleChange} required autoComplete="new-password" />
        </div>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="btn btn--primary btn--full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account…' : 'Create account →'}
        </button>
      </form>

      <p className="auth-footer-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  )
}

export default RegisterForm
