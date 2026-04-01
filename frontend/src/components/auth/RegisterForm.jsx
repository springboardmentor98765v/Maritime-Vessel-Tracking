import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { Eye, EyeOff, User, Mail, Lock, Shield, ChevronRight, UserCheck } from 'lucide-react'

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
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState(null)

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
                setError('Unable to connect to the server.')
            }
        }
    }

    const inputStyle = (field) => ({
        width: '100%',
        background: focusedField === field ? 'rgba(34,211,238,0.05)' : 'rgba(0,0,0,0.25)',
        border: `1px solid ${focusedField === field ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '12px',
        padding: '0.8rem 1rem',
        color: '#fff',
        fontSize: '0.87rem',
        outline: 'none',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
        boxShadow: focusedField === field ? '0 0 0 3px rgba(34,211,238,0.1)' : 'none',
    })

    const labelStyle = {
        display: 'block',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.45)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: '0.45rem',
    }

    return (
        <div style={{ width: '100%', maxWidth: '500px' }}>
            {/* Card */}
            <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: 'linear-gradient(160deg, rgba(16,26,52,0.95) 0%, rgba(8,14,30,0.98) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.25rem', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.06)', position: 'relative', overflow: 'hidden' }}>
                {/* Top glow line */}
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '200px', height: '200px', background: 'radial-gradient(circle at top left, rgba(34,211,238,0.07), transparent 60%)', pointerEvents: 'none' }} />

                {/* Header */}
                <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(34,211,238,0.2))', border: '1px solid rgba(99,102,241,0.35)', display: 'grid', placeItems: 'center' }}>
                            <UserCheck size={16} color="#818cf8" />
                        </div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif', margin: 0 }}>Create account</h2>
                    </div>
                    <p style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.4)', margin: 0, paddingLeft: '0.25rem' }}>Start tracking vessels in minutes — no credit card required</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    {/* Name row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                        <div>
                            <label style={labelStyle}>First name</label>
                            <input id="first_name" type="text" name="first_name" placeholder="Alex"
                                value={form.first_name} onChange={handleChange} required
                                onFocus={() => setFocusedField('first_name')}
                                onBlur={() => setFocusedField(null)}
                                style={inputStyle('first_name')} />
                        </div>
                        <div>
                            <label style={labelStyle}>Last name</label>
                            <input id="last_name" type="text" name="last_name" placeholder="Morgan"
                                value={form.last_name} onChange={handleChange} required
                                onFocus={() => setFocusedField('last_name')}
                                onBlur={() => setFocusedField(null)}
                                style={inputStyle('last_name')} />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label style={labelStyle}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'username' ? '#22d3ee' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s', pointerEvents: 'none' }} />
                            <input id="reg-username" type="text" name="username" placeholder="alexmorgan"
                                value={form.username} onChange={handleChange} required autoComplete="username"
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField(null)}
                                style={{ ...inputStyle('username'), paddingLeft: '2.4rem' }} />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={labelStyle}>Work email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#22d3ee' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s', pointerEvents: 'none' }} />
                            <input id="email" type="email" name="email" placeholder="alex@maritime.com"
                                value={form.email} onChange={handleChange} required autoComplete="email"
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                style={{ ...inputStyle('email'), paddingLeft: '2.4rem' }} />
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label style={labelStyle}>Access role</label>
                        <div style={{ position: 'relative' }}>
                            <Shield size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'role' ? '#22d3ee' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s', pointerEvents: 'none', zIndex: 1 }} />
                            <select id="reg-role" name="role" value={form.role} onChange={handleChange}
                                onFocus={() => setFocusedField('role')}
                                onBlur={() => setFocusedField(null)}
                                style={{ ...inputStyle('role'), paddingLeft: '2.4rem', cursor: 'pointer', appearance: 'none' }}>
                                <option value="operator" style={{ background: '#0a1628' }}>Fleet Operator</option>
                                <option value="analyst" style={{ background: '#0a1628' }}>Data Analyst</option>
                                <option value="admin" style={{ background: '#0a1628' }}>System Administrator</option>
                            </select>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label style={labelStyle}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#22d3ee' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s', pointerEvents: 'none' }} />
                            <input id="reg-password" type={showPassword ? 'text' : 'password'} name="password"
                                placeholder="Create a secure password"
                                value={form.password} onChange={handleChange} required autoComplete="new-password"
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                style={{ ...inputStyle('password'), paddingLeft: '2.4rem', paddingRight: '3rem' }} />
                            <button type="button" onClick={() => setShowPassword(s => !s)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.color = '#22d3ee'}
                                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(239,68,68,0.2)', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 800, color: '#ef4444' }}>!</span>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={status === 'loading'}
                        whileHover={status !== 'loading' ? { y: -2, boxShadow: '0 12px 32px rgba(99,102,241,0.4)' } : {}}
                        whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
                        style={{ width: '100%', background: status === 'loading' ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg, #6366f1, #22d3ee)', border: 'none', borderRadius: '12px', padding: '0.9rem', fontSize: '0.92rem', fontWeight: 700, color: status === 'loading' ? 'rgba(255,255,255,0.3)' : '#040914', cursor: status === 'loading' ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: status !== 'loading' ? '0 4px 20px rgba(99,102,241,0.35)' : 'none', transition: 'all 0.2s', marginTop: '0.25rem' }}
                    >
                        {status === 'loading' ? (
                            <>
                                <div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                                Creating account...
                            </>
                        ) : (
                            <>Create account <ChevronRight size={16} /></>
                        )}
                    </motion.button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.83rem', color: 'rgba(255,255,255,0.35)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#22d3ee', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </div>
            </motion.div>
        </div>
    )
}

export default RegisterForm

