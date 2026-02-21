import { useState, useEffect } from 'react'
import api from '../services/api'

function StatusCard({ title, icon, status, detail, color }) {
    return (
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.3rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '.78rem', color: 'var(--text-2)' }}>{status}</span>
                </div>
                {detail && <div style={{ fontSize: '.73rem', color: 'var(--text-2)', marginTop: '.2rem' }}>{detail}</div>}
            </div>
        </div>
    )
}

export default function AdminPage() {
    const [safetyEvents, setSafetyEvents] = useState([])
    const [vessels, setVessels] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastSync, setLastSync] = useState(new Date().toLocaleString())

    const SEVERITY_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' }

    const loadAll = () => {
        setLoading(true)
        Promise.all([
            api.get('/safety-events/').then(r => r.data).catch(() => []),
            api.get('/vessels/').then(r => r.data).catch(() => []),
        ])
            .then(([se, ve]) => {
                setSafetyEvents(se)
                setVessels(ve)
                setLastSync(new Date().toLocaleString())
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadAll() }, [])

    const activeSafety = safetyEvents.filter(e => e.is_active)
    const criticalSafety = activeSafety.filter(e => e.severity === 'critical').length
    const positionedVessels = vessels.filter(v => v.last_position_lat != null).length

    return (
        <div style={{ display: 'grid', gap: '1.75rem', animation: 'fadeUp .38s ease both' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title">🛠️ Admin Tools</h1>
                    <p className="page-subtitle">API source status, data overview, and monitoring.</p>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={loadAll} disabled={loading}>
                    {loading ? 'Refreshing…' : '⟳ Refresh'}
                </button>
            </div>

            {/* API Source Status */}
            <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.85rem' }}>API Source Status</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.85rem' }}>
                    <StatusCard
                        title="AISHub — Vessel Positions"
                        icon="📡"
                        status={positionedVessels > 0 ? 'Connected · Data received' : 'No position data yet'}
                        detail={`${positionedVessels} vessels with live position`}
                        color={positionedVessels > 0 ? '#22c55e' : '#eab308'}
                    />
                    <StatusCard
                        title="NOAA — Safety Events"
                        icon="🌪️"
                        status={activeSafety.length > 0 ? 'Connected · Events loaded' : 'No active events'}
                        detail={`${activeSafety.length} active · ${criticalSafety} critical`}
                        color={criticalSafety > 0 ? '#ef4444' : activeSafety.length > 0 ? '#22c55e' : '#eab308'}
                    />
                    <StatusCard
                        title="UNCTAD — Port Analytics"
                        icon="⚓"
                        status={vessels.length > 0 ? 'Operational' : 'Awaiting data'}
                        detail={`Last synced: ${lastSync}`}
                        color="#22c55e"
                    />
                    <StatusCard
                        title="Django Backend"
                        icon="⚙️"
                        status="Running at 127.0.0.1:8000"
                        detail="REST API · JWT Auth · SQLite"
                        color="#22c55e"
                    />
                </div>
            </div>

            {/* Data overview cards */}
            <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.85rem' }}>Platform Data Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '.85rem' }}>
                    {[
                        { label: 'Total Vessels', value: vessels.length, icon: '🚢' },
                        { label: 'Positioned Vessels', value: positionedVessels, icon: '📍' },
                        { label: 'Safety Zones (active)', value: activeSafety.length, icon: '🛡️' },
                        { label: 'Critical Alerts', value: criticalSafety, icon: '🚨' },
                    ].map(item => (
                        <div key={item.label} className="vessel-detail-card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '.4rem' }}>{item.icon}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{item.value}</div>
                            <div className="detail-label" style={{ marginTop: '.2rem' }}>{item.label}</div>
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
                    <div className="vessels-loading">Loading…</div>
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
                                            {Number(ev.latitude).toFixed(3)}°, {Number(ev.longitude).toFixed(3)}°
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
                    <a className="btn btn--ghost btn--sm" href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer">🔧 Django Admin</a>
                    <a className="btn btn--ghost btn--sm" href="http://127.0.0.1:8000/api/vessels/" target="_blank" rel="noreferrer">🚢 Vessels API</a>
                    <a className="btn btn--ghost btn--sm" href="http://127.0.0.1:8000/api/ports/analytics/" target="_blank" rel="noreferrer">📊 Analytics API</a>
                    <a className="btn btn--ghost btn--sm" href="http://127.0.0.1:8000/api/safety-events/" target="_blank" rel="noreferrer">🛡 Safety API</a>
                </div>
            </div>
        </div>
    )
}
