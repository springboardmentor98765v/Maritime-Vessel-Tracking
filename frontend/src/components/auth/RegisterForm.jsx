import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const initialState = {
  name: '',
  email: '',
  role: 'Operator',
  password: '',
}

function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formState, setFormState] = useState(initialState)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setError('')

    try {
      await register(formState)
      setStatus('success')
      navigate('/dashboard')
    } catch (err) {
      setStatus('error')
      setError('Unable to register. Verify fields or API status.')
    }
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Start tracking vessels in minutes.</p>
      </div>
      <label className="field">
        <span>Full name</span>
        <input
          type="text"
          name="name"
          placeholder="Alex Morgan"
          value={formState.name}
          onChange={handleChange}
          required
        />
      </label>
      <label className="field">
        <span>Work email</span>
        <input
          type="email"
          name="email"
          placeholder="analyst@portauthority.com"
          value={formState.email}
          onChange={handleChange}
          required
        />
      </label>
      <label className="field">
        <span>Role</span>
        <select name="role" value={formState.role} onChange={handleChange}>
          <option value="Operator">Operator</option>
          <option value="Analyst">Analyst</option>
          <option value="Admin">Admin</option>
        </select>
      </label>
      <label className="field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          placeholder="Create a secure password"
          value={formState.password}
          onChange={handleChange}
          required
        />
      </label>
      {error ? <div className="auth-error">{error}</div> : null}
      <button type="submit" className="button button--primary" disabled={status === 'loading'}>
        {status === 'loading' ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}

export default RegisterForm
