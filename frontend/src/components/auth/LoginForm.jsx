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
  const [showPassword, setShowPassword] = useState(false)

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
    } catch (err) {
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
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Your secure password"
            value={formState.password}
            onChange={handleChange}
            required
            style={{ paddingRight: 44 }}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((s) => !s)}
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
              color: '#6b7280',
              zIndex: 2
            }}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#374151" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 013.153-4.278M6.1 6.1L17.9 17.9" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#374151" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </label>
      {error ? <div className="auth-error">{error}</div> : null}
      <button type="submit" className="button button--primary" disabled={status === 'loading'}>
        {status === 'loading' ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}

export default LoginForm
