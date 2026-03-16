import { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts'
import api from '../services/api'

import { Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#38bdf8', '#6366f1', '#22d3ee', '#a855f7', '#34d399', '#f59e0b', '#60a5fa', '#ef4444']

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <AnimatePresence>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15 }}
                    style={{ 
                        background: 'rgba(8, 17, 38, 0.95)', 
                        backdropFilter: 'blur(12px)',
                        border: '1px solid var(--border-hi)', 
                        borderRadius: '12px', 
                        padding: '1rem', 
                        fontSize: '0.85rem',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                        minWidth: '180px'
                    }}
                >
                    {label && (
                        <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                            <Info size={14} color="var(--brand-cyan)" /> {label}
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {payload.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                                <span style={{ color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || p.color, boxShadow: `0 0 8px ${p.fill || p.color}` }} />
                                    {p.name || p.dataKey}
                                </span>
                                <strong style={{ color: '#fff', fontFamily: '"Space Grotesk", sans-serif', fontSize: '1rem' }}>{p.value}</strong>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        )
    }
    return null
}

function SummaryCard({ label, value, accent }) {
    return (
        <motion.div 
            className="card"
            style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${accent || 'rgba(56,189,248,0.5)'}, transparent)` }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent || 'var(--brand-cyan)', boxShadow: `0 0 10px ${accent || 'var(--brand-cyan)'}` }} />
                <div className="label-sm">{label}</div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Inter', sans-serif", color: '#fff', letterSpacing: '-0.01em', lineHeight: 1, marginTop: '0.25rem' }}>{value}</div>
        </motion.div>
    )
}

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeUp 0.38s ease both' }}>
            <div style={{ height: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', animation: 'pulseOpacity 1.5s infinite' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', animation: 'pulseOpacity 1.5s infinite' }} />)}
            </div>
            <div style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', animation: 'pulseOpacity 1.5s infinite' }} />
        </div>
    )
    if (!data) return <div className="detail-error">Failed to load analytics data.</div>

    const s = data.summary

    const portChartData = (data.top_congested_ports || []).map(p => ({
        name: p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name,
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

  return (
        <div style={{ display: 'grid', gap: '2rem', animation: 'fadeUp .4s ease both', padding: '1.5rem 0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: '10%', width: '400px', height: '200px', background: 'radial-gradient(ellipse at top right, rgba(56,189,248,0.1), transparent 60%)', filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none' }} />
            
            <div style={{ marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
                <h1 className="page-title">Analytics Dashboard</h1>
                <p className="page-subtitle" style={{ fontSize: '0.95rem' }}>Platform-wide maritime intelligence and real-time statistical aggregates.</p>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <SummaryCard label="Total Vessels" value={s.total_vessels} accent="#38bdf8" />
                <SummaryCard label="Total Ports" value={s.total_ports} accent="#6366f1" />
                <SummaryCard label="Total Voyages" value={s.total_voyages} accent="#22d3ee" />
                <SummaryCard label="Total Events" value={s.total_events} accent="#f59e0b" />
                <SummaryCard label="Avg Congestion" value={`${s.avg_congestion_score}%`} accent="#ef4444" />
            </div>

            {/* Port congestion bar chart */}
            {portChartData.length > 0 && (
                <div className="card" style={{ position: 'relative', zIndex: 1 }}>
                    <h2 className="card-title" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em', marginBottom: '1.5rem' }}>Top Ports by Congestion</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={portChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="bar-gradient-critical" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#991b1b" stopOpacity={0.4}/>
                                </linearGradient>
                                <linearGradient id="bar-gradient-high" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#b45309" stopOpacity={0.4}/>
                                </linearGradient>
                                <linearGradient id="bar-gradient-normal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#0369a1" stopOpacity={0.4}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-2)" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis domain={[0, 100]} stroke="var(--text-2)" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="score" name="Congestion Score" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                                {portChartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.score >= 80 ? 'url(#bar-gradient-critical)' : entry.score >= 60 ? 'url(#bar-gradient-high)' : 'url(#bar-gradient-normal)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Two pie charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', position: 'relative', zIndex: 1 }}>
                {vesselPieData.length > 0 && (
                    <div className="card">
                        <h2 className="card-title" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em', marginBottom: '1.5rem' }}>Vessel Type Breakdown</h2>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <Pie
                                    data={vesselPieData}
                                    cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value"
                                    stroke="var(--bg-2)"
                                    strokeWidth={4}
                                    isAnimationActive={true} animationDuration={1200} animationEasing="ease-out"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, length1: 10, length2: 15 }}
                                >
                                    {vesselPieData.map((entry, i) => <Cell key={i} fill={entry.fill} style={{ filter: `drop-shadow(0px 8px 16px ${entry.fill}40)`, outline: 'none' }} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {voyagePieData.length > 0 && (
                    <div className="card">
                        <h2 className="card-title" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em', marginBottom: '1.5rem' }}>Voyage Status Breakdown</h2>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <Pie
                                    data={voyagePieData}
                                    cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value"
                                    stroke="var(--bg-2)"
                                    strokeWidth={4}
                                    isAnimationActive={true} animationDuration={1200} animationEasing="ease-out"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, length1: 10, length2: 15 }}
                                >
                                    {voyagePieData.map((entry, i) => <Cell key={i} fill={entry.fill} style={{ filter: `drop-shadow(0px 8px 16px ${entry.fill}40)`, outline: 'none' }} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {portChartData.length === 0 && vesselPieData.length === 0 && (
                <div className="vessels-empty" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: '16px', padding: '4rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-1)', fontSize: '1.1rem' }}>No analytics data yet. Run <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>python manage.py seed_data</code> in your backend to populate sample data.</p>
                </div>
            )}
        </div>
    )
}
