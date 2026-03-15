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
            whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.15)' }}
            style={{ 
                background: 'linear-gradient(180deg, rgba(30,41,59,0.3) 0%, rgba(15,23,42,0.6) 100%)', 
                border: '1px solid rgba(255,255,255,0.06)', 
                borderRadius: '16px', 
                padding: '24px', 
                backdropFilter: 'blur(16px)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'border-color 0.3s ease'
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${accent || 'rgba(56,189,248,0.5)'}, transparent)` }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent || 'var(--brand-cyan)', boxShadow: `0 0 10px ${accent || 'var(--brand-cyan)'}` }} />
                <div style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
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
        <div style={{ display: 'grid', gap: '2rem', animation: 'fadeUp .38s ease both' }}>
            <div>
                <h1 className="page-title">Analytics Dashboard</h1>
                <p className="page-subtitle">Platform-wide maritime intelligence and statistics.</p>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <SummaryCard label="Total Vessels" value={s.total_vessels} accent="#38bdf8" />
                <SummaryCard label="Total Ports" value={s.total_ports} accent="#6366f1" />
                <SummaryCard label="Total Voyages" value={s.total_voyages} accent="#22d3ee" />
                <SummaryCard label="Total Events" value={s.total_events} accent="#f59e0b" />
                <SummaryCard label="Avg Congestion" value={`${s.avg_congestion_score}%`} accent="#ef4444" />
            </div>

            {/* Port congestion bar chart */}
            {portChartData.length > 0 && (
                <div className="card">
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1.25rem', color: '#fff' }}>Top Ports by Congestion Score</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={portChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="bar-gradient-critical" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2}/>
                                </linearGradient>
                                <linearGradient id="bar-gradient-high" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                </linearGradient>
                                <linearGradient id="bar-gradient-normal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.2}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-2)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 100]} stroke="var(--text-2)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                            <Bar dataKey="score" name="Congestion Score" radius={[6, 6, 0, 0]}>
                                {portChartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.score >= 80 ? 'url(#bar-gradient-critical)' : entry.score >= 60 ? 'url(#bar-gradient-high)' : 'url(#bar-gradient-normal)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Two pie charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {vesselPieData.length > 0 && (
                    <div className="card">
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1.25rem', color: '#fff' }}>Vessel Type Breakdown</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={vesselPieData}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value"
                                    stroke="rgba(8, 17, 38, 0.8)"
                                    strokeWidth={3}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                                >
                                    {vesselPieData.map((entry, i) => <Cell key={i} fill={entry.fill} style={{ filter: `drop-shadow(0px 4px 12px ${entry.fill}40)` }} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {voyagePieData.length > 0 && (
                    <div className="card">
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1.25rem', color: '#fff' }}>Voyage Status Breakdown</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={voyagePieData}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value"
                                    stroke="rgba(8, 17, 38, 0.8)"
                                    strokeWidth={3}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                                >
                                    {voyagePieData.map((entry, i) => <Cell key={i} fill={entry.fill} style={{ filter: `drop-shadow(0px 4px 12px ${entry.fill}40)` }} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {portChartData.length === 0 && vesselPieData.length === 0 && (
                <div className="vessels-empty">
                    <p>No analytics data yet. Run <code>python manage.py seed_data</code> in your backend to populate sample data.</p>
                </div>
            )}
        </div>
    )
}
