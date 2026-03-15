import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Anchor, Ship, ArrowRight, Clock, Calendar } from 'lucide-react'
import api from '../services/api'

const STATUS_CFG = {
    completed: { label: 'Completed', bg: 'rgba(34,197,94,0.15)', color: '#86efac', border: 'rgba(34,197,94,0.3)' },
    in_transit: { label: 'In Transit', bg: 'rgba(56,189,248,0.15)', color: '#7dd3fc', border: 'rgba(56,189,248,0.3)' },
    delayed: { label: 'Delayed', bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
    cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
}

function getStatus(status) {
    const s = (status || '').toLowerCase()
    const found = Object.entries(STATUS_CFG).find(([k]) => s.includes(k))
    return found ? found[1] : { label: status, bg: 'rgba(255,255,255,0.05)', color: 'var(--text-1)', border: 'rgba(255,255,255,0.1)' }
}

function VoyageCard({ voyage, onClick }) {
    const status = getStatus(voyage.status)
    const progress = voyage.status?.toLowerCase().includes('completed') ? 100
        : voyage.status?.toLowerCase().includes('in_transit') ? 55
        : voyage.status?.toLowerCase().includes('delayed') ? 40
        : 0;

    return (
        <div
            onClick={() => onClick(voyage)}
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {/* Top: vessel name + status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Ship size={16} color="var(--brand-cyan)" />
                    <span style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>{voyage.vessel_name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                    {status.label}
                </span>
            </div>

            {/* Route visualization */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-2)', fontSize: '13px' }}>
                    <Anchor size={13} />
                    <span>{voyage.port_from_name || 'Origin'}</span>
                </div>
                <div style={{ flex: 1, position: 'relative', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #38bdf8, #6366f1)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                    {progress > 0 && progress < 100 && (
                        <div style={{ position: 'absolute', top: '50%', left: `${progress}%`, transform: 'translate(-50%, -50%)', width: 10, height: 10, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-2)', fontSize: '13px' }}>
                    <Anchor size={13} />
                    <span>{voyage.port_to_name || 'Destination'}</span>
                </div>
            </div>

            {/* Dates */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '12px', color: 'var(--text-2)' }}>
                    <Calendar size={12} />
                    <span>Departed: {new Date(voyage.departure_time).toLocaleDateString()}</span>
                </div>
                {voyage.arrival_time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '12px', color: 'var(--text-2)' }}>
                        <Clock size={12} />
                        <span>Arrived: {new Date(voyage.arrival_time).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

function ReplayPanel({ voyage, onClose }) {
    const [replay, setReplay] = useState(null)
    const [step, setStep] = useState(0)
    const [playing, setPlaying] = useState(false)

    useEffect(() => {
        api.get(`/voyages/${voyage.id}/replay/`)
            .then(r => { setReplay(r.data); setStep(0) })
            .catch(console.error)
    }, [voyage.id])

    useEffect(() => {
        if (!playing || !replay) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (step >= replay.waypoints.length - 1) { setPlaying(false); return }
        const t = setTimeout(() => setStep(s => s + 1), 1200)
        return () => clearTimeout(t)
    }, [playing, step, replay])

    if (!replay) return <div className="detail-loading">Loading replay data…</div>

    const current = replay.waypoints[step]
    const total = replay.waypoints.length

    return (
        <div className="card card--glow">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Voyage Replay</h2>
                <button className="btn btn--ghost btn--sm" onClick={onClose}>Close</button>
            </div>

            {/* Route header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '.85rem', fontWeight: 600 }}>{replay.voyage.vessel_name}</span>
                <span style={{ color: 'var(--text-2)', fontSize: '.78rem' }}>
                    {replay.voyage.port_from_name} → {replay.voyage.port_to_name}
                </span>
            </div>

            {/* Stepper */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                {/* Track */}
                <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, margin: '0 12px' }}>
                    <div style={{ height: '100%', background: 'var(--brand-grad)', borderRadius: 99, width: `${(step / (total - 1)) * 100}%`, transition: 'width .6s' }} />
                </div>
                {/* Dots */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-7px', padding: '0 4px' }}>
                    {replay.waypoints.map((wp, i) => (
                        <button
                            key={i}
                            onClick={() => setStep(i)}
                            title={wp.label}
                            style={{
                                width: 14, height: 14, borderRadius: '50%', border: 'none', cursor: 'pointer',
                                background: i <= step
                                    ? (wp.type === 'departure' ? '#22c55e' : wp.type === 'arrival' ? '#22d3ee' : '#f59e0b')
                                    : 'var(--bg-3)',
                                transition: 'background .3s',
                                flexShrink: 0,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Current waypoint */}
            <div className="vessel-detail-card" style={{ marginBottom: '1rem' }}>
                <div className="detail-label">
                    {current.type === 'departure' ? 'Departure' : current.type === 'arrival' ? 'Destination' : 'Event'}
                </div>
                <div className="detail-value" style={{ marginTop: '.25rem' }}>{current.label}</div>
                {current.timestamp && (
                    <div style={{ fontSize: '.75rem', color: 'var(--text-2)', marginTop: '.2rem' }}>
                        {new Date(current.timestamp).toLocaleString()}
                    </div>
                )}
                {current.details && (
                    <p style={{ fontSize: '.8rem', marginTop: '.35rem', color: 'var(--text-1)' }}>{current.details}</p>
                )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
                <button className="btn btn--ghost btn--sm" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Prev</button>
                <button
                    className={`btn btn--sm ${playing ? 'btn--danger' : 'btn--primary'}`}
                    onClick={() => setPlaying(p => !p)}
                    disabled={step >= total - 1 && !playing}
                >
                    {playing ? 'Pause' : step >= total - 1 ? 'Restart' : 'Play'}
                </button>
                <button className="btn btn--ghost btn--sm" onClick={() => setStep(s => Math.min(total - 1, s + 1))} disabled={step >= total - 1}>Next</button>
                <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'var(--text-2)' }}>Step {step + 1} / {total}</span>
            </div>

            {/* Position info if available */}
            {replay.vessel_last_lat && (
                <div style={{ marginTop: '.85rem', fontSize: '.75rem', color: 'var(--text-2)' }}>
                    Last known position: {Number(replay.vessel_last_lat).toFixed(4)}°, {Number(replay.vessel_last_lon).toFixed(4)}°
                </div>
            )}
        </div>
    )
}

export default function VoyageReplayPage() {
    const [voyages, setVoyages] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [filter, setFilter] = useState('')

    useEffect(() => {
        api.get('/voyages/')
            .then(r => setVoyages(r.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filtered = voyages.filter(v =>
        !filter || v.vessel_name?.toLowerCase().includes(filter.toLowerCase()) ||
        v.port_from_name?.toLowerCase().includes(filter.toLowerCase()) ||
        v.port_to_name?.toLowerCase().includes(filter.toLowerCase())
    )

    const stats = {
        active: voyages.filter(v => v.status?.toLowerCase().includes('in_transit')).length,
        completed: voyages.filter(v => v.status?.toLowerCase().includes('completed')).length,
        delayed: voyages.filter(v => v.status?.toLowerCase().includes('delayed')).length,
        total: voyages.length,
    }

    return (
        <div style={{ display: 'grid', gap: '2rem', animation: 'fadeUp .38s ease both' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 700 }}>Voyage Replay</h1>
                    <p className="page-subtitle">Select a voyage to replay its route and view waypoint events.</p>
                </div>
                <input
                    className="vessel-search-input"
                    style={{ width: '280px', flexShrink: 0 }}
                    placeholder="Search vessel, port…"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>

            {/* Stats Row */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {[
                        { label: 'Total Voyages', value: stats.total, color: '#38bdf8' },
                        { label: 'In Transit', value: stats.active, color: '#7dd3fc' },
                        { label: 'Completed', value: stats.completed, color: '#86efac' },
                        { label: 'Delayed', value: stats.delayed, color: '#fcd34d' },
                    ].map(stat => (
                        <div
                            key={stat.label}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                            }}
                        >
                            <div style={{ width: 4, height: 36, borderRadius: 99, background: stat.color, flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>{stat.value}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px', fontWeight: 500 }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Grid: List + Detail */}
            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: voyage list */}
                <div style={{ display: 'grid', gap: '12px' }}>
                    {loading ? (
                        <div className="vessels-loading">Loading voyages…</div>
                    ) : filtered.length === 0 ? (
                        <div className="vessels-empty">No voyages found. Run <code>python manage.py seed_data</code> to populate data.</div>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
                            {filtered.map(v => (
                                <VoyageCard
                                    key={v.id}
                                    voyage={v}
                                    onClick={voy => setSelected(voy.id === selected?.id ? null : voy)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: replay panel */}
                {selected && (
                    <div>
                        <ReplayPanel voyage={selected} onClose={() => setSelected(null)} />
                    </div>
                )}
            </div>
        </div>
    )
}
