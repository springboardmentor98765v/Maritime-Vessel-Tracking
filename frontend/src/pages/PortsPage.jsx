import { useState, useEffect } from 'react'
import { fetchPortCongestion } from '../services/portService'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const LEVEL_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    moderate: '#eab308',
    low: '#22c55e',
}

function LevelDot({ level }) {
    return (
        <span
            style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: LEVEL_COLORS[level] || '#888',
                marginRight: 6,
                flexShrink: 0,
                boxShadow: `0 0 6px ${LEVEL_COLORS[level] || '#888'}88`,
            }}
        />
    )
}

// Custom tooltip for bar chart
function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(15,23,42,0.95)',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
            }}>
                <p style={{ color: '#94a3b8', margin: 0, marginBottom: 4 }}>{label}</p>
                {payload.map(p => (
                    <p key={p.dataKey} style={{ color: p.color, margin: '2px 0', fontWeight: 600 }}>
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function PortsPage() {
    const [ports, setPorts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [lastRefresh, setLastRefresh] = useState(null)
    const [activeTab, setActiveTab] = useState('table') // 'table' | 'charts'

    const loadData = async () => {
        setLoading(true)
        try {
            setPorts(await fetchPortCongestion())
            setLastRefresh(new Date().toLocaleTimeString())
            setError('')
        } catch {
            setError('Failed to load port congestion data.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
        const t = setInterval(loadData, 120_000)
        return () => clearInterval(t)
    }, [])

    const criticalCount = ports.filter(p => p.congestion_level === 'critical').length

    // Prepare chart data — top 10 ports
    const chartData = ports.slice(0, 10).map(p => ({
        name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
        Arrivals: p.arrivals,
        Departures: p.departures,
        Score: parseFloat(p.congestion_score) || 0,
        level: p.congestion_level,
    }))

    if (loading && ports.length === 0) return (
        <div className="ports-loading">Loading port congestion data...</div>
    )

    if (error) return (
        <div className="ports-error">
            <strong>Connection Error</strong>
            <p style={{ marginTop: '.5rem', fontSize: '.85rem' }}>{error}</p>
            <button className="btn btn--ghost btn--sm" style={{ marginTop: '1rem' }} onClick={loadData}>
                Retry
            </button>
        </div>
    )

    return (
        <div className="ports-page">
            {/* Header */}
            <div className="ports-header">
                <div>
                    <h1>Port Congestion Dashboard</h1>
                    <p className="ports-subtitle">
                        {ports.length} ports monitored &middot; {criticalCount} critical alert{criticalCount !== 1 && 's'}
                        {lastRefresh && <span className="ports-refresh"> &middot; Updated {lastRefresh}</span>}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                        className={`btn btn--sm ${activeTab === 'table' ? 'btn--primary' : 'btn--ghost'}`}
                        onClick={() => setActiveTab('table')}
                    >
                        Table
                    </button>
                    <button
                        className={`btn btn--sm ${activeTab === 'charts' ? 'btn--primary' : 'btn--ghost'}`}
                        onClick={() => setActiveTab('charts')}
                    >
                        Charts
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={loadData} disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="congestion-summary">
                {['critical', 'high', 'moderate', 'low'].map(level => {
                    const count = ports.filter(p => p.congestion_level === level).length
                    return (
                        <div key={level} className={`congestion-summary-card congestion-summary-card--${level}`}>
                            <LevelDot level={level} />
                            <span className="cs-count">{count}</span>
                            <span className="cs-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                        </div>
                    )
                })}
            </div>

            {/* Tab: Table */}
            {activeTab === 'table' && (
                <div className="ports-table-wrap">
                    <table className="ports-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Port</th>
                                <th>Country</th>
                                <th>Status</th>
                                <th>Score</th>
                                <th>Avg Wait (h)</th>
                                <th>Arrivals</th>
                                <th>Departures</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ports.map((port, idx) => (
                                <tr key={port.id} className={port.alert ? 'port-row--alert' : ''}>
                                    <td className="text-muted">{idx + 1}</td>
                                    <td>
                                        <span className="port-name-link">{port.name}</span>
                                        <div className="port-location-label">{port.location}</div>
                                    </td>
                                    <td>{port.country}</td>
                                    <td>
                                        <span
                                            className="congestion-badge"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                background: LEVEL_COLORS[port.congestion_level] + '22',
                                                color: LEVEL_COLORS[port.congestion_level],
                                                border: `1px solid ${LEVEL_COLORS[port.congestion_level]}44`,
                                            }}
                                        >
                                            <LevelDot level={port.congestion_level} />
                                            {port.congestion_level}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="score-bar-wrap">
                                            <div className="score-bar-track">
                                                <div
                                                    className="score-bar"
                                                    style={{ width: `${port.congestion_score}%`, background: LEVEL_COLORS[port.congestion_level] }}
                                                />
                                            </div>
                                            <span className="score-val">{port.congestion_score ?? '—'}</span>
                                        </div>
                                    </td>
                                    <td>{port.avg_wait_time ?? '—'}</td>
                                    <td>{port.arrivals ?? '—'}</td>
                                    <td>{port.departures ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab: Charts */}
            {activeTab === 'charts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>

                    {/* Chart 1: Arrivals vs Departures */}
                    <div className="chart-card">
                        <h2 className="chart-title">Arrivals vs Departures — Top 10 Ports</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                                <Bar dataKey="Arrivals" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Departures" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Chart 2: Congestion Score */}
                    <div className="chart-card">
                        <h2 className="chart-title">Congestion Score — Top 10 Ports</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="Score"
                                    radius={[4, 4, 0, 0]}
                                    name="Congestion Score"
                                    fill="#f97316"
                                    label={{ position: 'top', fill: '#94a3b8', fontSize: 10, formatter: v => v > 0 ? v : '' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    )
}
