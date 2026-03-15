import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState('email') // email | otp | resetPassword
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpResendCountdown, setOtpResendCountdown] = useState(0)

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/send-otp/', { email })
      setStep('otp')
      startResendCountdown()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/verify-otp/', { email, otp })
      setStep('resetPassword')
      setSuccess('OTP verified! Now set your new password.')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
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
      await api.post('/auth/reset-password-otp/', {
        email,
        new_password: newPassword,
      })
      setSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Unable to reset password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP after countdown
  const handleResendOTP = async () => {
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/send-otp/', { email })
      setOtp('')
      startResendCountdown()
    } catch {
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startResendCountdown = () => {
    setOtpResendCountdown(60)
    const interval = setInterval(() => {
      setOtpResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
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
            <h2 className="auth-card__title" style={{ margin: 0 }}>Forgot password</h2>
          </div>
          <p className="auth-card__sub">
            {step === 'email' ? 'Enter your account email to receive OTP.' : 
             step === 'otp' ? 'Enter the OTP sent to your email.' :
             'Set your new password'}
          </p>
        </div>

        {/* EMAIL STEP */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP} style={{ display: 'grid', gap: '1rem' }}>
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

            {error && <div className="form-error">{error}</div>}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '.25rem' }}>
              <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <Link to="/login" className="btn btn--ghost" style={{ flex: 1, textAlign: 'center' }}>
                Back to sign in
              </Link>
            </div>
          </form>
        )}

        {/* OTP STEP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'grid', gap: '1rem' }}>
            <div className="field">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                name="otp"
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
                autoFocus
              />
              <p style={{ fontSize: '.78rem', color: 'var(--text-2)', marginTop: '.5rem' }}>
                OTP has been sent to <strong>{email}</strong>
              </p>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div style={{ textAlign: 'center' }}>
              {otpResendCountdown > 0 ? (
                <p style={{ fontSize: '.85rem', color: 'var(--text-2)' }}>
                  Resend OTP in <strong>{otpResendCountdown}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  style={{
                    fontSize: '.85rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand)',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <Link to="/login" className="btn btn--ghost btn--full" style={{ textAlign: 'center' }}>
              Back to sign in
            </Link>
          </form>
        )}

        {/* RESET PASSWORD STEP */}
        {step === 'resetPassword' && (
          <form onSubmit={handleResetPassword} style={{ display: 'grid', gap: '1rem' }}>
            {success && <div className="form-success">{success}</div>}

            <div className="field">
              <label htmlFor="new_password">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="new_password"
                  type={showPassword ? 'text' : 'password'}
                  name="new_password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  autoFocus
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
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
                    color: '#6b7280',
                    zIndex: 2
                  }}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
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

            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password →'}
            </button>

            <Link to="/login" className="btn btn--ghost btn--full" style={{ textAlign: 'center' }}>
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
