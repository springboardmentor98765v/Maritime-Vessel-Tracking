import { useState, useEffect, useMemo } from 'react'
import { fetchPortCongestion } from '../services/portService'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { Anchor, Search, Filter, AlertTriangle, Activity, BarChart3, Database, Globe, Clock, Ship, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import SkeletonLoader from '../components/common/SkeletonLoader'

const LEVEL_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    moderate: '#eab308',
    low: '#22d3ee', // changed from green to cyan for the palette
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
            setError('Global port network uplink failed. Retrying connection...')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
        const t = setInterval(loadData, 120_000)
        return () => clearInterval(t)
    }, [])

    const countries = useMemo(() =>
        [...new Set(ports.map(p => p.country))].sort(), [ports])

    const filtered = useMemo(() => {
        let result = [...ports]
        if (search) result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.country.toLowerCase().includes(search.toLowerCase()))
        if (countryFilter) result = result.filter(p => p.country === countryFilter)
        if (levelFilter) result = result.filter(p => p.congestion_level === levelFilter)
        result.sort((a, b) => {
            const va = a[sortBy] ?? 0, vb = b[sortBy] ?? 0
            const cmp = typeof va === 'string' ? String(va).localeCompare(String(vb)) : va - vb
            return sortDir === 'asc' ? cmp : -cmp
        })
        return result
    }, [ports, search, countryFilter, levelFilter, sortBy, sortDir])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const criticalCount = ports.filter(p => p.congestion_level === 'critical').length
    const chartData = ports.slice(0, 15).map(p => ({
        ...p,
        name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name
    }))

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortBy(col); setSortDir('desc') }
    }
    const SortIcon = ({ col }) => sortBy === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''

    useEffect(() => setPage(1), [search, countryFilter, levelFilter, sortBy, sortDir])

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    }
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    }

    if (error) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', marginTop: '2rem' }}>
            <AlertTriangle size={48} style={{ marginBottom: '1rem', opacity: 0.8 }} />
            <h2>Connection Error</h2>
            <p>{error}</p>
            <button style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }} onClick={loadData}>Re-establish Connection</button>
        </div>
    )

    return (
        <motion.div initial="hidden" animate="show" variants={containerVariants} style={{ padding: '1.5rem 2rem', paddingBottom: '4rem' }}>
            
            {/* Header */}
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title">
                        <Anchor color="var(--brand-cyan)" size={32} /> Global Terminal Congestion
                    </h1>
                    <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {loading ? 'Aggregating terminal data...' : `Monitoring ${ports.length} global trade hubs`} 
                        &middot; <span style={{ color: criticalCount > 0 ? '#ef4444' : 'var(--text-1)', fontWeight: criticalCount > 0 ? 700 : 400 }}>{criticalCount} CRITICAL THREATS</span>
                        {lastRefresh && <span>&middot; SYNOD: {lastRefresh}</span>}
                    </p>
                </div>
                <button 
                    onClick={loadData} 
                    disabled={loading}
                    style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--brand-cyan)', border: '1px solid rgba(34,211,238,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { if(!loading) e.currentTarget.style.background = 'rgba(34,211,238,0.2)' }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(34,211,238,0.1)' }}
                >
                    <Activity size={16} /> {loading ? 'PROCESSING...' : 'SYNC TERMINALS'}
                </button>
            </motion.div>

            {loading && ports.length === 0 ? (
                <div style={{ padding: '2rem 0' }}>
                    <SkeletonLoader type="card" count={4} style={{ marginBottom: '2.5rem' }} />
                    <SkeletonLoader type="row" count={8} />
                </div>
            ) : (
                <>
                    {/* Summary Matrix */}
                    <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {['critical', 'high', 'moderate', 'low'].map(level => {
                            const count = ports.filter(p => p.congestion_level === level).length;
                            const isActive = levelFilter === level;
                            const color = LEVEL_COLORS[level];
                            return (
                                <motion.div key={level} variants={itemVariants}
                                    className="card"
                                    onClick={() => setLevelFilter(prev => prev === level ? '' : level)}
                                    style={{ 
                                        cursor: 'pointer', background: isActive ? `linear-gradient(180deg, ${color}20 0%, ${color}05 100%)` : undefined, 
                                        border: isActive ? `1px solid ${color}` : undefined, 
                                        display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                        position: 'relative', overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${color}90, transparent)` }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-1)', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}` }} />
                                            {level} CONGESTION
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>{count}</div>
                                </motion.div>
                            )
                        })}
                    </motion.div>

                    {/* Analytics Charts */}
                    <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="card">
                            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BarChart3 size={18} color="var(--brand-cyan)" /> Top 15 Operations Bottlenecks
                            </h2>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                        <defs>
                                            <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#22d3ee" stopOpacity={1}/>
                                                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.2}/>
                                            </linearGradient>
                                            <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#eab308" stopOpacity={1}/>
                                                <stop offset="100%" stopColor="#eab308" stopOpacity={0.2}/>
                                            </linearGradient>
                                            <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
                                                <stop offset="100%" stopColor="#f97316" stopOpacity={0.2}/>
                                            </linearGradient>
                                            <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                                                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--text-2)" fontSize={11} angle={-30} textAnchor="end" interval={0} tickLine={false} axisLine={false} dx={-10} dy={10} />
                                        <YAxis stroke="var(--text-2)" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: 'rgba(8, 17, 38, 0.95)', border: '1px solid var(--border-hi)', borderRadius: '12px', backdropFilter: 'blur(16px)', color: '#fff', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#22d3ee' }} />
                                        <Bar dataKey="congestion_score" name="Congestion Index" radius={[6, 6, 0, 0]}>
                                            {chartData.map((entry, index) => {
                                                const lvl = entry.congestion_level;
                                                const grad = lvl === 'critical' ? 'url(#colorRed)' : lvl === 'high' ? 'url(#colorOrange)' : lvl === 'moderate' ? 'url(#colorYellow)' : 'url(#colorCyan)'
                                                return <Cell key={`cell-${index}`} fill={grad} />
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="card">
                            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowUpRight size={18} color="#8b5cf6" /> Vessel Traffic Flow (Arrivals/Departures)
                            </h2>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                        <defs>
                                            <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#38bdf8" stopOpacity={1}/>
                                                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.2}/>
                                            </linearGradient>
                                            <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--text-2)" fontSize={11} angle={-30} textAnchor="end" interval={0} tickLine={false} axisLine={false} dx={-10} dy={10} />
                                        <YAxis stroke="var(--text-2)" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: 'rgba(8, 17, 38, 0.95)', border: '1px solid var(--border-hi)', borderRadius: '12px', backdropFilter: 'blur(16px)', color: '#fff', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
                                        <Bar dataKey="arrivals" name="Inbound" fill="url(#colorArr)" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="departures" name="Outbound" fill="url(#colorDep)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filter Bar */}
                    <motion.div variants={itemVariants} className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', background: 'rgba(8, 20, 45, 0.65)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-1)', fontWeight: 700, fontSize: '0.85rem', paddingRight: '1.5rem', borderRight: '1px solid var(--border-hi)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Filter size={16} color="var(--brand-cyan)" /> TACTICAL FILTERS
                        </div>
                        
                        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                            <Search size={16} color="var(--brand-cyan)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="text" placeholder="Search Terminal or Territory..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '8px', padding: '0.75rem 1rem 0.75rem 2.5rem', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }} onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(34,211,238,0.2)'} />
                        </div>

                        <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} style={{ flex: 1, minWidth: '180px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                            <option value="" style={{ background: 'var(--bg-1)' }}>Global Territories</option>
                            {countries.map(c => <option key={c} value={c} style={{ background: 'var(--bg-1)' }}>{c}</option>)}
                        </select>

                        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={{ flex: 1, minWidth: '180px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                            <option value="" style={{ background: 'var(--bg-1)' }}>All Threat Levels</option>
                            {['critical', 'high', 'moderate', 'low'].map(l => <option key={l} value={l} style={{ background: 'var(--bg-1)' }}>{l.toUpperCase()}</option>)}
                        </select>

                        {(search || countryFilter || levelFilter) && (
                            <button onClick={() => { setSearch(''); setCountryFilter(''); setLevelFilter('') }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.7rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s', textTransform: 'uppercase' }} onMouseOver={e => e.target.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}>
                                Clear Filters
                            </button>
                        )}
                        <span style={{ marginLeft: 'auto', opacity: 0.8, fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--brand-cyan)' }}>
                            {filtered.length} / {ports.length} TRM
                        </span>
                    </motion.div>

                    {/* Matrix Grid */}
                    <div className="card" style={{ overflowX: 'auto', padding: '0.5rem 1.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                                    <th onClick={() => handleSort('name')} style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>Terminal <SortIcon col="name" /></th>
                                    <th onClick={() => handleSort('country')} style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>Territory <SortIcon col="country" /></th>
                                    <th onClick={() => handleSort('congestion_level')} style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>Status <SortIcon col="congestion_level" /></th>
                                    <th onClick={() => handleSort('congestion_score')} style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>Congestion Index <SortIcon col="congestion_score" /></th>
                                    <th onClick={() => handleSort('avg_wait_time')} style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>Avg Delay (H) <SortIcon col="avg_wait_time" /></th>
                                    <th onClick={() => handleSort('arrivals')} style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'right' }}>In <SortIcon col="arrivals" /></th>
                                    <th onClick={() => handleSort('departures')} style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'right' }}>Out <SortIcon col="departures" /></th>
                                </tr>
                            </thead>
                            <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                                {paginated.map((port) => (
                                    <motion.tr variants={itemVariants} key={port.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', color: LEVEL_COLORS[port.congestion_level] }}>
                                                    <Database size={16} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{port.name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', opacity: 0.8 }}>{port.location || 'Coordinates unavailable'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-1)' }}>
                                                <Globe size={14} opacity={0.5} /> {port.country}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: `${LEVEL_COLORS[port.congestion_level]}15`, color: LEVEL_COLORS[port.congestion_level], border: `1px solid ${LEVEL_COLORS[port.congestion_level]}40`, padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: LEVEL_COLORS[port.congestion_level], boxShadow: `0 0 6px ${LEVEL_COLORS[port.congestion_level]}` }} />
                                                {port.congestion_level}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${port.congestion_score}%`, height: '100%', background: LEVEL_COLORS[port.congestion_level], boxShadow: `0 0 10px ${LEVEL_COLORS[port.congestion_level]}` }} />
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{port.congestion_score ?? '—'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-1)', fontFamily: 'monospace' }}>
                                                <Clock size={14} opacity={0.5} /> {port.avg_wait_time ?? '—'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>{port.arrivals ?? '—'}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#8b5cf6' }}>{port.departures ?? '—'}</td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                    </div>

                    {/* Matrix Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem', marginTop: '1.5rem', padding: '0 0.5rem' }}>
                            <button style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }} onClick={() => setPage(1)} disabled={page === 1}>«</button>
                            <button style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>PREV</button>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let p = page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                                if(p < 1) p = 1;
                                if(p > totalPages) p = totalPages;
                                return (
                                    <button key={p} 
                                        style={{ background: page === p ? 'rgba(34,211,238,0.15)' : 'var(--surface-1)', border: page === p ? '1px solid var(--brand-cyan)' : '1px solid var(--border)', color: page === p ? 'var(--brand-cyan)' : 'var(--text-1)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: page === p ? 700 : 400 }}
                                        onClick={() => setPage(p)}
                                    >{p}</button>
                                )
                            })}
                            
                            <button style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>NEXT</button>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    )
}
