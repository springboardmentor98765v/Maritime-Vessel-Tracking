import { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import api from '../services/api'
import { Ship, Anchor, Activity, BarChart3, AlertTriangle, Globe, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#38bdf8', '#6366f1', '#22d3ee', '#a855f7', '#34d399', '#f59e0b', '#60a5fa', '#ef4444']

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                        background: 'rgba(8, 17, 38, 0.97)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '0.85rem 1.1rem',
                        fontSize: '0.85rem',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                        minWidth: '180px',
                    }}
                >
                    {label && (
                        <div style={{ fontWeight: 700, marginBottom: '0.65rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                            <Info size={13} color="#22d3ee" /> {label}
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {payload.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.fill || p.color, boxShadow: `0 0 6px ${p.fill || p.color}` }} />
                                    {p.name || p.dataKey}
                                </span>
                                <strong style={{ color: '#fff', fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.95rem' }}>{p.value}</strong>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        )
    }
    return null
}

// Renders a single KPI hero card
// eslint-disable-next-line no-unused-vars
function HeroKPI({ label, value, icon: Icon, accent, suffix = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: `0 20px 44px rgba(0,0,0,0.4), 0 0 0 1px ${accent}40` }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            style={{
                position: 'relative',
                background: 'linear-gradient(160deg, rgba(16,24,48,0.9) 0%, rgba(8,14,32,0.98) 100%)',
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: '20px',
                padding: '1.5rem 1.75rem',
                overflow: 'hidden',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}
        >
            {/* Accent glow top-right */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `radial-gradient(circle at top right, ${accent}22, transparent 70%)`, pointerEvents: 'none' }} />
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1.5px', background: `linear-gradient(90deg, transparent, ${accent}80, transparent)` }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)' }}>{label}</div>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${accent}18`, border: `1px solid ${accent}35`, display: 'grid', placeItems: 'center' }}>
                    <Icon size={18} color={accent} />
                </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {value}{suffix}
            </div>
        </motion.div>
    )
}

// Custom Pie legend
const PieLegend = ({ data }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginTop: '1.25rem', justifyContent: 'center' }}>
        {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '99px', padding: '0.3rem 0.75rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill, boxShadow: `0 0 6px ${d.fill}` }} />
                {d.name} <span style={{ color: d.fill, fontWeight: 800, marginLeft: 2 }}>{d.value}</span>
            </div>
        ))}
    </div>
)

export default function AnalyticsDashboardPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/ports/analytics/')
            .then(r => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', animation: 'pulseOpacity 1.5s infinite' }} />)}
            </div>
            <div style={{ height: '320px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', animation: 'pulseOpacity 1.5s infinite' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ height: '340px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', animation: 'pulseOpacity 1.5s infinite' }} />
                <div style={{ height: '340px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', animation: 'pulseOpacity 1.5s infinite' }} />
            </div>
        </div>
    )
    if (!data) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '16px' }}><AlertTriangle size={40} style={{ marginBottom: '1rem' }} /><p>Failed to load analytics data.</p></div>

    const s = data.summary

    const portChartData = (data.top_congested_ports || []).map(p => ({
        name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
        score: Math.round(p.congestion_score),
        wait: Math.round(p.avg_wait_time * 10) / 10,
    }))

    const vesselPieData = (data.vessel_type_breakdown || []).map((v, i) => ({
        name: v.vessel_type || 'Unknown',
        value: v.count,
        fill: COLORS[i % COLORS.length],
    }))

    const voyagePieData = (data.voyage_status_breakdown || []).map((v, i) => ({
        name: v.status || 'Unknown',
        value: v.count,
        fill: COLORS[(i + 3) % COLORS.length],
    }))

    const kpis = [
        { label: 'Total Vessels', value: s.total_vessels, icon: Ship, accent: '#38bdf8' },
        { label: 'Total Ports', value: s.total_ports, icon: Anchor, accent: '#6366f1' },
        { label: 'Total Voyages', value: s.total_voyages, icon: Globe, accent: '#22d3ee' },
        { label: 'Total Events', value: s.total_events, icon: Activity, accent: '#f59e0b' },
        { label: 'Avg Congestion', value: s.avg_congestion_score, icon: BarChart3, accent: '#ef4444', suffix: '%' },
    ]

    return (
        <div style={{ display: 'grid', gap: '2rem', paddingBottom: '4rem', position: 'relative' }}>
            {/* Background glow accents */}
            <div style={{ position: 'absolute', top: 0, right: '5%', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(56,189,248,0.07) 0%, transparent 65%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '30%', left: '0%', width: '300px', height: '200px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

            {/* Page Header */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 className="page-title">Analytics Dashboard</h1>
                <p className="page-subtitle">Platform-wide maritime intelligence and real-time statistical aggregates.</p>
            </div>

            {/* Hero KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
                {kpis.map((kpi, i) => <HeroKPI key={i} {...kpi} />)}
            </div>

            {/* Port Congestion Bar Chart */}
            {portChartData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                    style={{ position: 'relative', zIndex: 1 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 className="card-title" style={{ marginBottom: '0.25rem' }}>Top Ports by Congestion</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', margin: 0 }}>Measured by operational congestion index (0–100)</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {[{ label: '≥80 CRITICAL', color: '#ef4444' }, { label: '≥60 HIGH', color: '#f59e0b' }, { label: 'NORMAL', color: '#38bdf8' }].map(t => (
                                <span key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', fontWeight: 700, color: t.color, background: `${t.color}12`, border: `1px solid ${t.color}30`, borderRadius: '99px', padding: '0.25rem 0.65rem' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color }} />{t.label}
                                </span>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={portChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="barCrit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#991b1b" stopOpacity={0.3} />
                                </linearGradient>
                                <linearGradient id="barHigh" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#b45309" stopOpacity={0.3} />
                                </linearGradient>
                                <linearGradient id="barNorm" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#0369a1" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-2)" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis domain={[0, 100]} stroke="var(--text-2)" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="score" name="Congestion Score" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1200} animationEasing="ease-out">
                                {portChartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.score >= 80 ? 'url(#barCrit)' : entry.score >= 60 ? 'url(#barHigh)' : 'url(#barNorm)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* Pie Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                {vesselPieData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card"
                    >
                        <h2 className="card-title" style={{ marginBottom: '0.25rem' }}>Vessel Type Distribution</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', margin: '0 0 1.25rem' }}>Fleet composition by vessel category</p>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={vesselPieData}
                                    cx="50%" cy="50%"
                                    innerRadius={72} outerRadius={105}
                                    dataKey="value"
                                    stroke="rgba(8,17,38,0.9)"
                                    strokeWidth={3}
                                    isAnimationActive animationDuration={1400} animationEasing="ease-out"
                                >
                                    {vesselPieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} style={{ filter: `drop-shadow(0 4px 10px ${entry.fill}50)`, outline: 'none' }} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <PieLegend data={vesselPieData} />
                    </motion.div>
                )}

                {voyagePieData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card"
                    >
                        <h2 className="card-title" style={{ marginBottom: '0.25rem' }}>Voyage Status Breakdown</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', margin: '0 0 1.25rem' }}>Fleet operational status overview</p>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={voyagePieData}
                                    cx="50%" cy="50%"
                                    innerRadius={72} outerRadius={105}
                                    dataKey="value"
                                    stroke="rgba(8,17,38,0.9)"
                                    strokeWidth={3}
                                    isAnimationActive animationDuration={1400} animationEasing="ease-out"
                                >
                                    {voyagePieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} style={{ filter: `drop-shadow(0 4px 10px ${entry.fill}50)`, outline: 'none' }} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <PieLegend data={voyagePieData} />
                    </motion.div>
                )}
            </div>

            {portChartData.length === 0 && vesselPieData.length === 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: '16px', padding: '4rem', textAlign: 'center' }}>
                    <Activity size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-1)', fontSize: '1rem' }}>No analytics data yet. Run <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>python manage.py seed_baseline</code> in your backend to populate data.</p>
                </div>
            )}
        </div>
    )
}
