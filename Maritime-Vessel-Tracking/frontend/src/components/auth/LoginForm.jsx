import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const initialState = {
  username: '',
  password: '',
}

function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
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
      await login(formState)
      setStatus('success')
      navigate('/dashboard')
    } catch {
      setStatus('error')
      setError('Unable to sign in. Check credentials or API status.')
    }
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div>
        <h2 className="auth-title">Sign in</h2>
        <p className="auth-subtitle">Access live vessel tracking and alerts.</p>
      </div>
      <label className="field">
        <span>Username</span>
        <input
          type="text"
          name="username"
          placeholder="alexmorgan"
          value={formState.username}
          onChange={handleChange}
          required
        />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          placeholder="Your secure password"
          value={formState.password}
          onChange={handleChange}
          required
        />
      </label>
      {error ? <div className="auth-error">{error}</div> : null}
      <button type="submit" className="button button--primary" disabled={status === 'loading'}>
        {status === 'loading' ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}

export default LoginForm
