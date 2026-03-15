import { useState } from "react";
import { changePassword } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.new_password !== form.confirm_password) {
      setError('New password and confirmation do not match')
      return
    }

    if (!validatePassword(form.new_password)) {
      setError('Password must be 8+ chars and include upper, lower, number & special char')
      return
    }

    setLoading(true)
    try {
      await changePassword({
        old_password: form.old_password,
        new_password: form.new_password,
      });

      addToast("Password changed successfully. Please login again.", "success");
      navigate("/login");
    } catch {
      setError("Old password is incorrect or new password is invalid.");
      addToast("Failed to change password.", "error");
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
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card__header">
          <h2 className="auth-card__title">Change Password</h2>
          <p className="auth-card__sub">Update your password to keep your account secure.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="old_password">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="old_password"
                name="old_password"
                type={showOld ? 'text' : 'password'}
                placeholder="Enter current password"
                value={form.old_password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              {renderToggleBtn(showOld, () => setShowOld(s => !s), 'current password')}
            </div>
          </div>

          <div className="field">
            <label htmlFor="new_password">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="new_password"
                name="new_password"
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                value={form.new_password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                style={{ paddingRight: 44 }}
              />
              {renderToggleBtn(showNew, () => setShowNew(s => !s), 'new password')}
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirm_password">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirm_password"
                name="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={form.confirm_password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                style={{ paddingRight: 44 }}
              />
              {renderToggleBtn(showConfirm, () => setShowConfirm(s => !s), 'confirmation')}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Updating…' : 'Update password →'}
          </button>
        </form>
      </div>
    </div>
  )
}

