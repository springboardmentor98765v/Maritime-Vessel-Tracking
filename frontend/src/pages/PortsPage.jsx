import { useState, useEffect, useMemo } from 'react'
import { fetchPortCongestion } from '../services/portService'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const LEVEL_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    moderate: '#eab308',
    low: '#22c55e',
}

function LevelDot({ level }) {
    return (
        <span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
            background: LEVEL_COLORS[level] || '#888', marginRight: 6, flexShrink: 0,
            boxShadow: `0 0 6px ${LEVEL_COLORS[level] || '#888'}88`,
        }} />
    )
}

const PAGE_SIZE = 25

export default function PortsPage() {
    const [ports, setPorts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [lastRefresh, setLastRefresh] = useState(null)
    const [search, setSearch] = useState('')
    const [countryFilter, setCountryFilter] = useState('')
    const [levelFilter, setLevelFilter] = useState('')
    const [sortBy, setSortBy] = useState('congestion_score')
    const [sortDir, setSortDir] = useState('desc')
    const [page, setPage] = useState(1)

    const loadData = async () => {
        setLoading(true)
        try {
            setPorts(await fetchPortCongestion())
            setLastRefresh(new Date().toLocaleTimeString())
            setError('')
        } catch {
            setError('Failed to load port data. Make sure the backend is running at http://127.0.0.1:8000')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
        const t = setInterval(loadData, 120_000)
        return () => clearInterval(t)
    }, [])

    // Unique countries for filter dropdown
    const countries = useMemo(() =>
        [...new Set(ports.map(p => p.country))].sort(), [ports])

    // Filtered & sorted ports
    const filtered = useMemo(() => {
        let result = [...ports]
        if (search) result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.country.toLowerCase().includes(search.toLowerCase()))
        if (countryFilter) result = result.filter(p => p.country === countryFilter)
        if (levelFilter) result = result.filter(p => p.congestion_level === levelFilter)
        result.sort((a, b) => {
            const va = a[sortBy] ?? 0, vb = b[sortBy] ?? 0
            const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb
            return sortDir === 'asc' ? cmp : -cmp
        })
        return result
    }, [ports, search, countryFilter, levelFilter, sortBy, sortDir])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const criticalCount = ports.filter(p => p.congestion_level === 'critical').length
    const chartData = ports.slice(0, 15) // top 15 for charts

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortBy(col); setSortDir('desc') }
    }
    const SortIcon = ({ col }) => sortBy === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''

    useEffect(() => setPage(1), [search, countryFilter, levelFilter, sortBy, sortDir])

    if (loading && ports.length === 0) return <div className="ports-loading">Loading port congestion data...</div>
    if (error) return (
        <div className="ports-error">
            <strong>Connection Error</strong>
            <p style={{ marginTop: '.5rem', fontSize: '.85rem' }}>{error}</p>
            <button className="btn btn--ghost btn--sm" style={{ marginTop: '1rem' }} onClick={loadData}>Retry</button>
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
                <button className="btn btn--ghost btn--sm" onClick={loadData} disabled={loading}>
                    {loading ? 'Refreshing...' : '⟳ Refresh'}
                </button>
            </div>

            {/* Summary cards */}
            <div className="congestion-summary">
                {['critical', 'high', 'moderate', 'low'].map(level => {
                    const count = ports.filter(p => p.congestion_level === level).length
                    return (
                        <div key={level}
                            className={`congestion-summary-card congestion-summary-card--${level}${levelFilter === level ? ' active' : ''}`}
                            onClick={() => setLevelFilter(prev => prev === level ? '' : level)}
                            style={{ cursor: 'pointer' }}
                        >
                            <LevelDot level={level} />
                            <span className="cs-count">{count}</span>
                            <span className="cs-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                        </div>
                    )
                })}
            </div>

            {/* Charts Section — top 15 ports only */}
            <div className="ports-charts" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>Top 15 — Congestion Score</h3>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-2)" fontSize={10} angle={-40} textAnchor="end" interval={0} />
                                <YAxis stroke="var(--text-2)" fontSize={11} domain={[0, 100]} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                <Bar dataKey="congestion_score" name="Congestion Score" fill="var(--brand-cyan)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>Top 15 — Arrivals vs Departures</h3>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-2)" fontSize={10} angle={-40} textAnchor="end" interval={0} />
                                <YAxis stroke="var(--text-2)" fontSize={11} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="arrivals" name="Arrivals" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="departures" name="Departures" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Search / Filter Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
                <input
                    type="text"
                    className="vessel-search-input"
                    placeholder="🔍  Search port or country..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ minWidth: 220, flex: 1 }}
                />
                <select className="vessel-select" value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
                    <option value="">All Countries</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="vessel-select" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
                    <option value="">All Levels</option>
                    {['critical', 'high', 'moderate', 'low'].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
                {(search || countryFilter || levelFilter) && (
                    <button className="btn btn--ghost btn--sm" onClick={() => { setSearch(''); setCountryFilter(''); setLevelFilter('') }}>
                        ✕ Clear
                    </button>
                )}
                <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.82rem' }}>
                    Showing {filtered.length} of {ports.length} ports
                </span>
            </div>

            {/* Table */}
            <div className="ports-table-wrap">
                <table className="ports-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>#</th>
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Port <SortIcon col="name" /></th>
                            <th onClick={() => handleSort('country')} style={{ cursor: 'pointer' }}>Country <SortIcon col="country" /></th>
                            <th onClick={() => handleSort('congestion_level')} style={{ cursor: 'pointer' }}>Status <SortIcon col="congestion_level" /></th>
                            <th onClick={() => handleSort('congestion_score')} style={{ cursor: 'pointer' }}>Score <SortIcon col="congestion_score" /></th>
                            <th onClick={() => handleSort('avg_wait_time')} style={{ cursor: 'pointer' }}>Avg Wait (h) <SortIcon col="avg_wait_time" /></th>
                            <th onClick={() => handleSort('arrivals')} style={{ cursor: 'pointer' }}>Arrivals <SortIcon col="arrivals" /></th>
                            <th onClick={() => handleSort('departures')} style={{ cursor: 'pointer' }}>Departures <SortIcon col="departures" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((port, idx) => (
                            <tr key={port.id} className={port.alert ? 'port-row--alert' : ''}>
                                <td className="text-muted">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                <td>
                                    <span className="port-name-link">{port.name}</span>
                                    <div className="port-location-label">{port.location}</div>
                                </td>
                                <td>{port.country}</td>
                                <td>
                                    <span className="congestion-badge" style={{
                                        display: 'inline-flex', alignItems: 'center',
                                        background: LEVEL_COLORS[port.congestion_level] + '22',
                                        color: LEVEL_COLORS[port.congestion_level],
                                        border: `1px solid ${LEVEL_COLORS[port.congestion_level]}44`,
                                    }}>
                                        <LevelDot level={port.congestion_level} />
                                        {port.congestion_level}
                                    </span>
                                </td>
                                <td>
                                    <div className="score-bar-wrap">
                                        <div className="score-bar-track">
                                            <div className="score-bar"
                                                style={{ width: `${port.congestion_score}%`, background: LEVEL_COLORS[port.congestion_level] }} />
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                    <button className="btn btn--ghost btn--sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                        let p
                        if (totalPages <= 7) p = i + 1
                        else if (page <= 4) p = i + 1
                        else if (page >= totalPages - 3) p = totalPages - 6 + i
                        else p = page - 3 + i
                        return (
                            <button key={p} className={`btn btn--sm ${page === p ? 'btn--primary' : 'btn--ghost'}`}
                                onClick={() => setPage(p)}>{p}</button>
                        )
                    })}
                    <button className="btn btn--ghost btn--sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next ›</button>
                    <button className="btn btn--ghost btn--sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
                    <span style={{ opacity: 0.55, fontSize: '0.8rem' }}>Page {page} of {totalPages}</span>
                </div>
            )}
        </div>
    )
}
