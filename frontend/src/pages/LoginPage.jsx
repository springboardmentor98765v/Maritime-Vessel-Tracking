import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReCAPTCHA from 'react-google-recaptcha'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { Eye, EyeOff, Ship, Lock, User, ChevronRight, Shield, Globe, Activity, Anchor } from 'lucide-react'

// Google reCAPTCHA v2 test site key
const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

const FEATURES = [
    { icon: Globe, color: '#22d3ee', label: 'Global Vessel Tracking', desc: 'Live AIS positions across all ocean regions' },
    { icon: Anchor, color: '#6366f1', label: 'Port Congestion Intelligence', desc: 'Real-time terminal scores and wait forecasts' },
    { icon: Shield, color: '#34d399', label: 'Safety Zone Alerts', desc: 'NOAA-sourced maritime risk overlays' },
    { icon: Activity, color: '#f59e0b', label: 'Live Fleet Analytics', desc: 'Aggregated KPIs and voyage replay' },
]

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [form, setForm] = useState({ username: '', password: '', role: 'operator' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState(null)
    const [captchaToken, setCaptchaToken] = useState(null)
    
    // Proper ref
    const realCaptchaRef = React.useRef(null)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token)
        setError('')
    }

    const handleCaptchaExpired = () => {
        setCaptchaToken(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!captchaToken) {
            setError('Please complete the CAPTCHA verification.')
            return
        }

        setLoading(true)
        try {
            // Verify CAPTCHA server-side first
            await api.post('/auth/verify-captcha/', { token: captchaToken })

            // Proceed with login
            await login(form)
            navigate('/dashboard')
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.detail || 'Invalid credentials or role. Please try again.'
            setError(msg)
            // Reset CAPTCHA on failure
            realCaptchaRef.current?.reset()
            setCaptchaToken(null)
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = (field) => ({
        width: '100%',
        background: focusedField === field ? 'rgba(34,211,238,0.05)' : 'rgba(0,0,0,0.25)',
        border: `1px solid ${focusedField === field ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '12px',
        padding: '0.85rem 1rem',
        color: '#fff',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'all 0.2s',
        boxShadow: focusedField === field ? '0 0 0 3px rgba(34,211,238,0.1)' : 'none',
    })

    return (
        <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient background glows */}
            <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(34,211,238,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

            {/* ── Left Panel: Branding & Features ── */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 5rem', background: 'linear-gradient(160deg, rgba(8,17,38,0.85) 0%, rgba(4,9,20,0.95) 100%)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '4rem' }}
                >
                    <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'linear-gradient(135deg, #22d3ee, #3b82f6)', display: 'grid', placeItems: 'center', boxShadow: '0 0 24px rgba(34,211,238,0.4)' }}>
                        <Ship size={22} color="#040914" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif' }}>Maritime Vista</div>
                        <div style={{ fontSize: '0.65rem', color: '#22d3ee', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Intelligence Hub</div>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginBottom: '3rem' }}
                >
                    <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1.15, marginBottom: '1rem' }}>
                        Command-grade<br />
                        <span style={{ background: 'linear-gradient(90deg, #22d3ee, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>maritime intelligence</span>
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '420px' }}>
                        Track every vessel, forecast port congestion, and surface maritime risk — unified inside one powerful intelligence platform.
                    </p>
                </motion.div>

                {/* Feature list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.08 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${f.color}18`, border: `1px solid ${f.color}35`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                <f.icon size={18} color={f.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{f.label}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{f.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: '12px' }}
                >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'ping 2s infinite' }} />
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>All systems operational · Live data streaming</span>
                </motion.div>
            </motion.div>

            {/* ── Right Panel: Login Form ── */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            >
                <div style={{ width: '100%', maxWidth: '440px' }}>
                    {/* Card */}
                    <motion.div 
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        style={{ background: 'linear-gradient(160deg, rgba(16,26,52,0.95) 0%, rgba(8,14,30,0.98) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.06)', backdropFilter: 'blur(24px)', position: 'relative', overflow: 'hidden' }}>
                        {/* Subtle top glow */}
                        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)' }} />
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 60%)', pointerEvents: 'none' }} />

                        {/* Header */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif', marginBottom: '0.4rem' }}>Welcome back</h2>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>Sign in to your maritime command center</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                            {/* Username */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'username' ? '#22d3ee' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s', pointerEvents: 'none' }} />
                                    <input
                                        id="username" type="text" name="username"
                                        placeholder="Enter your username"
                                        value={form.username} onChange={handleChange} required
                                        autoComplete="username"
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField(null)}
                                        style={{ ...inputStyle('username'), paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Access Role</label>
                                <select
                                    id="role" name="role" value={form.role} onChange={handleChange}
                                    onFocus={() => setFocusedField('role')}
                                    onBlur={() => setFocusedField(null)}
                                    style={{ ...inputStyle('role'), cursor: 'pointer', appearance: 'none' }}
                                >
                                    <option value="operator" style={{ background: '#0a1628' }}>Fleet Operator</option>
                                    <option value="analyst" style={{ background: '#0a1628' }}>Data Analyst</option>
                                    <option value="admin" style={{ background: '#0a1628' }}>System Administrator</option>
                                </select>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#22d3ee' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s', pointerEvents: 'none' }} />
                                    <input
                                        id="password" type={showPassword ? 'text' : 'password'} name="password"
                                        placeholder="Enter your password"
                                        value={form.password} onChange={handleChange} required
                                        autoComplete="current-password"
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        style={{ ...inputStyle('password'), paddingLeft: '2.5rem', paddingRight: '3rem' }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(s => !s)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.color = '#22d3ee'}
                                        onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* CAPTCHA Widget */}
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                                <ReCAPTCHA
                                    ref={realCaptchaRef}
                                    sitekey={RECAPTCHA_SITE_KEY}
                                    onChange={handleCaptchaChange}
                                    onExpired={handleCaptchaExpired}
                                    theme="dark"
                                />
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(239,68,68,0.2)', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 800, color: '#ef4444' }}>!</span>
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={loading || !captchaToken}
                                whileHover={(!loading && captchaToken) ? { y: -2, boxShadow: '0 12px 32px rgba(34,211,238,0.45)' } : {}}
                                whileTap={(!loading && captchaToken) ? { scale: 0.98 } : {}}
                                style={{ width: '100%', background: (loading || !captchaToken) ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #22d3ee, #3b82f6)', border: 'none', borderRadius: '12px', padding: '0.95rem', fontSize: '0.95rem', fontWeight: 700, color: (loading || !captchaToken) ? 'rgba(255,255,255,0.4)' : '#040914', cursor: (loading || !captchaToken) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: (loading || !captchaToken) ? 'none' : '0 4px 20px rgba(34,211,238,0.3)', transition: 'all 0.2s', marginTop: '0.25rem' }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>Sign in <ChevronRight size={18} /></>
                                )}
                            </motion.button>
                        </form>

                        {/* Footer links */}
                        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: '#22d3ee', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}>Create one free</Link>
                            <span style={{ margin: '0 0.5rem', opacity: 0.4 }}>·</span>
                            <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}>Forgot password?</Link>
                        </div>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}
                    >
                        {['End-to-end encrypted', 'JWT secured', 'GDPR compliant'].map(t => (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(34,211,238,0.5)' }} />{t}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
