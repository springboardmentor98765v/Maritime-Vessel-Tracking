import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export default function ResetPasswordPage() {
  const { uid, token } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const email = searchParams.get('email') // From OTP flow
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if this is OTP flow or token flow
  const isOTPFlow = !!email
  const isTokenFlow = !!(uid && token)

  useEffect(() => {
    if (!isOTPFlow && !isTokenFlow) {
      setError('Invalid reset link or missing email')
    }
  }, [isOTPFlow, isTokenFlow])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      if (isOTPFlow) {
        // OTP-based password reset
        await api.post('/auth/reset-password-otp/', {
          email,
          new_password: newPassword,
        })
      } else {
        // Token-based password reset
        await api.post(
          '/auth/password-reset-confirm/',
          {
            uid,
            token,
            new_password: newPassword,
          }
        )
      }
      setSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Unable to reset password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card__header">
          <h2 className="auth-card__title">Create new password</h2>
          <p className="auth-card__sub">Enter a strong password to secure your account.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="new_password">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="new_password"
                type={showNew ? 'text' : 'password'}
                name="new_password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
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
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#374151" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 013.153-4.278M6.1 6.1L17.9 17.9" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#374151" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirm_password">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                name="confirm_password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
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
                  ,
                  zIndex: 2
                }}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#374151" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 013.153-4.278M6.1 6.1L17.9 17.9" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#374151" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset password →'}
          </button>
        </form>
      </div>
    </div>
  )
}
