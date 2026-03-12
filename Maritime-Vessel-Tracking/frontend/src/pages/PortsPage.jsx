import { useState, useEffect } from 'react'
import { fetchPortCongestion } from '../services/portService'

const LEVEL_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    moderate: '#eab308',
    low: '#22c55e',
}

export default function PortsPage() {
    const [ports, setPorts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [lastRefresh, setLastRefresh] = useState(null)

    const loadData = async () => {
        setLoading(true)
        try {
            setPorts(await fetchPortCongestion())
            setLastRefresh(new Date().toLocaleTimeString())
            setError('')
        } catch {
            setError('Failed to load port congestion data. Is the backend running?')
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

    if (loading && ports.length === 0) return <div className="ports-loading">Loading port congestion data…</div>
    if (error) return <div className="ports-error">{error}</div>

    return (
        <div className="ports-page">
            {/* Header */}
            <div className="ports-header">
                <div>
                    <h1>Port Congestion Dashboard</h1>
                    <p className="ports-subtitle">
                        {ports.length} ports monitored · {criticalCount} critical alert{criticalCount !== 1 && 's'}
                        {lastRefresh && <span className="ports-refresh"> · Updated {lastRefresh}</span>}
                    </p>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={loadData} disabled={loading}>
                    {loading ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            {/* Summary cards */}
            <div className="congestion-summary">
                {['critical', 'high', 'moderate', 'low'].map(level => {
                    const count = ports.filter(p => p.congestion_level === level).length
                    return (
                        <div key={level} className={`congestion-summary-card congestion-summary-card--${level}`}>
                            <span className="cs-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: LEVEL_COLORS[level], display: 'inline-block', marginRight: '.35rem' }} />
                            <span className="cs-count">{count}</span>
                            <span className="cs-label">{level}</span>
                        </div>
                    )
                })}
            </div>

            {/* Table */}
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
                                            background: LEVEL_COLORS[port.congestion_level] + '22',
                                            color: LEVEL_COLORS[port.congestion_level],
                                            border: `1px solid ${LEVEL_COLORS[port.congestion_level]}44`,
                                        }}
                                    >
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
        </div>
    )
}
