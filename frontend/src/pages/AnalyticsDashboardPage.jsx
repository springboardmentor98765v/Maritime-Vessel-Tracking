import { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts'
import api from '../services/api'

const COLORS = ['#22d3ee', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#22c55e', '#ef4444']

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-hi)', borderRadius: 8, padding: '.6rem .85rem', fontSize: '.78rem' }}>
                {label && <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>{label}</div>}
                {payload.map((p, i) => (
                    <div key={i} style={{ color: p.fill || p.color }}>{p.name || p.dataKey}: <strong>{p.value}</strong></div>
                ))}
            </div>
        )
    }
    return null
}

function SummaryCard({ label, value, accent }) {
    return (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 6, height: 48, borderRadius: 99, background: accent || 'var(--brand-grad)', flexShrink: 0 }} />
            <div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-2)', marginTop: '.1rem' }}>{label}</div>
            </div>
        </div>
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

    if (loading) return <div className="detail-loading">Loading analytics…</div>
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
                <SummaryCard label="Total Vessels" value={s.total_vessels} accent="#22d3ee" />
                <SummaryCard label="Total Ports" value={s.total_ports} accent="#3b82f6" />
                <SummaryCard label="Total Voyages" value={s.total_voyages} accent="#6366f1" />
                <SummaryCard label="Total Events" value={s.total_events} accent="#f59e0b" />
                <SummaryCard label="Avg Congestion" value={`${s.avg_congestion_score}%`} accent="#ef4444" />
            </div>

            {/* Port congestion bar chart */}
            {portChartData.length > 0 && (
                <div className="card">
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top Ports by Congestion Score</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={portChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,160,255,0.06)" />
                            <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-2)', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="score" name="Congestion Score" radius={[4, 4, 0, 0]}>
                                {portChartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.score >= 80 ? '#ef4444' : entry.score >= 60 ? '#f97316' : entry.score >= 35 ? '#eab308' : '#22c55e'} />
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
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Vessel Type Breakdown</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={vesselPieData}
                                    cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {vesselPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {voyagePieData.length > 0 && (
                    <div className="card">
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Voyage Status Breakdown</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={voyagePieData}
                                    cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {voyagePieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
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
