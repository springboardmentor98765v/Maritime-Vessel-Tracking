import { motion } from 'framer-motion'
import RegisterForm from '../components/auth/RegisterForm'
import { Ship, Globe, Anchor, Shield, Activity, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const STATS = [
    { value: '12,450+', label: 'Vessels tracked' },
    { value: '245', label: 'Ports monitored' },
    { value: '99.9%', label: 'System uptime' },
]

function RegisterPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient glows */}
            <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.09) 0%, transparent 55%), radial-gradient(ellipse at 20% 20%, rgba(34,211,238,0.07) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

            {/* ── Left: Form ── */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', borderRight: '1px solid rgba(255,255,255,0.04)' }}
            >
                <div style={{ width: '100%', maxWidth: '500px' }}>
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}
                    >
                        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #22d3ee, #3b82f6)', display: 'grid', placeItems: 'center', boxShadow: '0 0 20px rgba(34,211,238,0.35)' }}>
                                <Ship size={20} color="#040914" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}>Maritime Vista</div>
                                <div style={{ fontSize: '0.62rem', color: '#22d3ee', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Intelligence Hub</div>
                            </div>
                        </NavLink>
                    </motion.div>

                    <RegisterForm />

                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}
                    >
                        {['End-to-end encrypted', 'JWT secured', 'GDPR compliant'].map(t => (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)' }}>
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(34,211,238,0.45)' }} />{t}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Right: Brand Panel ── */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 5rem', background: 'linear-gradient(160deg, rgba(12,22,48,0.9) 0%, rgba(6,12,28,0.97) 100%)' }}
            >
                {/* Headline */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '99px', padding: '0.3rem 0.85rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 8px #818cf8' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Free to get started</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1.15, marginBottom: '1rem' }}>
                        The maritime platform<br />
                        <span style={{ background: 'linear-gradient(90deg, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>built for professionals</span>
                    </h1>
                    <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '400px', marginBottom: '2.5rem' }}>
                        Real-time AIS tracking, advanced port analytics, and automated safety alerts — all in one intelligence hub.
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}
                >
                    {STATS.map((s, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.1rem 1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Feature list */}
                {[
                    { icon: Globe, color: '#22d3ee', label: 'Real-time AIS vessel positions globally' },
                    { icon: Anchor, color: '#6366f1', label: 'Port congestion scores & wait forecasts' },
                    { icon: Shield, color: '#34d399', label: 'NOAA-sourced maritime safety overlays' },
                    { icon: Activity, color: '#f59e0b', label: 'Voyage replay and fleet analytics' },
                ].map((f, i) => (
                    <motion.div
                        key={f.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.07 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}
                    >
                        <div style={{ width: 34, height: 34, borderRadius: '9px', background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <f.icon size={16} color={f.color} />
                        </div>
                        <span style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{f.label}</span>
                    </motion.div>
                ))}

                {/* Already have account CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
                >
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>Already have an account?</span>
                    <NavLink to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#22d3ee', textDecoration: 'none' }}>
                        Sign in <ChevronRight size={14} />
                    </NavLink>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default RegisterPage
