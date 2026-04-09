import { useState, useEffect } from 'react'
import api from '../services/api'
import SkeletonLoader from '../components/common/SkeletonLoader'

function StatusDot({ color }) {
    return (
        <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block', flexShrink: 0 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
        </span>
    )
}

function StatusCard({ title, abbr, status, detail, color }) {
    return (
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', border: `1px solid ${color}40`, boxShadow: `0 4px 12px ${color}10`, position: 'relative', overflow: 'hidden', padding: '1.25rem' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at top right, ${color}20, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `linear-gradient(135deg, ${color}15, ${color}05)`, border: `1px solid ${color}30`,
                display: 'grid', placeItems: 'center', flexShrink: 0,
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
                fontSize: '.62rem', letterSpacing: '.05em', color: color
            }}>{abbr}</div>
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#fff' }}>{title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.3rem' }}>
                    <StatusDot color={color} />
                    <span style={{ fontSize: '.78rem', color: color === '#ef4444' ? '#fca5a5' : 'var(--text-2)', fontWeight: color === '#ef4444' ? 600 : 400 }}>{status}</span>
                </div>
                {detail && <div style={{ fontSize: '.73rem', color: 'var(--text-3)', marginTop: '.2rem' }}>{detail}</div>}
            </div>
        </div>
    )
}

export default function AdminPage() {
    const [safetyEvents, setSafetyEvents] = useState([])
    const [vessels, setVessels] = useState([])
    const [apiStatus, setApiStatus] = useState(null)
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastSync, setLastSync] = useState(new Date().toLocaleString())

    const SEVERITY_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' }

    const loadAll = () => {
        setLoading(true)
        Promise.all([
            api.get('/safety-events/').then(r => r.data).catch(() => []),
            api.get('/vessels/').then(r => r.data).catch(() => []),
            api.get('/api/admin/api-status/').then(r => r.data).catch(() => null),
            api.get('/api/admin/logs/').then(r => r.data).catch(() => []),
        ])
            .then(([se, ve, statusData, logsData]) => {
                setSafetyEvents(se)
                setVessels(ve)
                setApiStatus(statusData)
                setLogs(logsData)
                setLastSync(new Date().toLocaleString())
            })
            .finally(() => setLoading(false))
    }

    const handleExport = () => {
        window.open('http://127.0.0.1:8000/api/admin/export/voyages/', '_blank')
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { loadAll() }, [])

    const activeSafety = safetyEvents.filter(e => e.is_active)
    const criticalSafety = activeSafety.filter(e => e.severity === 'critical').length
    const positionedVessels = vessels.filter(v => v.last_position_lat != null).length

    return (
        <div style={{ display: 'grid', gap: '1.75rem', animation: 'fadeUp .38s ease both' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title">System Administration</h1>
                    <p className="page-subtitle">API source status, data overview, and platform monitoring.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn--outline btn--sm" onClick={handleExport} style={{ borderColor: 'var(--brand-cyan)', color: 'var(--brand-cyan)' }}>
                        Export Voyages (CSV)
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={loadAll} disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* API Source Status */}
            <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.85rem' }}>API Source Status</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.85rem' }}>
                    <StatusCard
                        title="MarineTraffic (Ext)"
                        abbr="EXT"
                        status={apiStatus?.marine_traffic === 'working' ? 'Connected — Data received' : 'Offline'}
                        detail={`Status: ${apiStatus?.marine_traffic || 'Unknown'}`}
                        color={apiStatus?.marine_traffic === 'working' ? '#22c55e' : '#ef4444'}
                    />
                    <StatusCard
                        title="NOAA — Safety Events"
                        abbr="NOAA"
                        status={apiStatus?.noaa === 'working' ? 'Connected — Events loaded' : 'Offline'}
                        detail={`Status: ${apiStatus?.noaa || 'Unknown'}`}
                        color={apiStatus?.noaa === 'working' ? '#22c55e' : '#ef4444'}
                    />
                    <StatusCard
                        title="UNCTAD — Port Analytics"
                        abbr="UNC"
                        status={vessels.length > 0 ? 'Operational' : 'Awaiting data'}
                        detail={`Last synced: ${lastSync}`}
                        color="#22c55e"
                    />
                    <StatusCard
                        title="Django Backend"
                        abbr="API"
                        status="Running at 127.0.0.1:8000"
                        detail={`Last Checked: ${apiStatus?.last_checked ? new Date(apiStatus.last_checked).toLocaleTimeString() : 'Unknown'}`}
                        color="#22c55e"
                    />
                </div>
            </div>

            {/* Data overview cards */}
            <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.85rem' }}>Platform Data Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '.85rem' }}>
                    {[
                        { label: 'Total Vessels', value: vessels.length, abbr: 'VES' },
                        { label: 'Positioned Vessels', value: positionedVessels, abbr: 'POS' },
                        { label: 'Safety Zones (active)', value: activeSafety.length, abbr: 'SAF' },
                        { label: 'Critical Alerts', value: criticalSafety, abbr: 'CRT' },
                    ].map(item => (
                        <div key={item.label} className="card" style={{ textAlign: 'center', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                display: 'grid', placeItems: 'center',
                                width: 44, height: 44, borderRadius: 12, marginBottom: '.75rem',
                                background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))', border: '1px solid rgba(34,211,238,0.2)',
                                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '.6rem',
                                letterSpacing: '.06em', color: 'var(--brand-cyan)'
                            }}>{item.abbr}</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: "'Inter', sans-serif", color: '#fff', lineHeight: 1 }}>{item.value.toLocaleString()}</div>
                            <div className="detail-label" style={{ marginTop: '.4rem', fontSize: '0.8rem' }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>



            {/* Active Safety Events table */}
            <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.85rem' }}>
                    Active Safety Events {activeSafety.length > 0 && <span className="badge badge--red" style={{ marginLeft: '.5rem' }}>{activeSafety.length}</span>}
                </h2>
                {loading ? (
                    <div style={{ marginTop: '1rem' }}>
                        <SkeletonLoader type="row" count={4} />
                    </div>
                ) : activeSafety.length === 0 ? (
                    <div className="vessels-empty">No active safety events. NOAA data is clear.</div>
                ) : (
                    <div className="vessels-table-wrap">
                        <table className="vessels-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Severity</th>
                                    <th>Location</th>
                                    <th>Radius (nm)</th>
                                    <th>Source</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeSafety.map(ev => (
                                    <tr key={ev.id}>
                                        <td style={{ fontWeight: 600, fontSize: '.82rem' }}>{ev.title}</td>
                                        <td><span className="badge badge--type">{ev.event_type}</span></td>
                                        <td>
                                            <span style={{
                                                fontWeight: 700, fontSize: '.75rem', textTransform: 'capitalize',
                                                color: SEVERITY_COLOR[ev.severity] || 'var(--text-1)',
                                            }}>
                                                {ev.severity}
                                            </span>
                                        </td>
                                        <td className="mono" style={{ fontSize: '.78rem' }}>
                                            {Number(ev.latitude).toFixed(3)}, {Number(ev.longitude).toFixed(3)}
                                        </td>
                                        <td style={{ fontSize: '.82rem' }}>{ev.radius_nm}</td>
                                        <td><span className="badge badge--blue">{ev.source}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick links */}
            <div className="card card--glow">
                <h2 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: '.85rem' }}>Quick Links</h2>
                <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                    <a className="btn btn--ghost btn--sm" href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer">Django Admin</a>
                    <a className="btn btn--ghost btn--sm" href="http://127.0.0.1:8000/vessels/" target="_blank" rel="noreferrer">Vessels API</a>
                    <a className="btn btn--ghost btn--sm" href="http://127.0.0.1:8000/ports/analytics/" target="_blank" rel="noreferrer">Analytics API</a>
                    <a className="btn btn--ghost btn--sm" href="http://127.0.0.1:8000/safety-events/" target="_blank" rel="noreferrer">Safety API</a>
                </div>
            </div>
        </div>
    )
}
