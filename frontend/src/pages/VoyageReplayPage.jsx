import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const STATUS_BADGE = {
    completed: { label: 'Completed', cls: 'badge--green' },
    in_transit: { label: 'In Transit', cls: 'badge--blue' },
    delayed: { label: 'Delayed', cls: 'badge--orange' },
    cancelled: { label: 'Cancelled', cls: 'badge--red' },
}

function getBadge(status) {
    const s = (status || '').toLowerCase()
    const found = Object.entries(STATUS_BADGE).find(([k]) => s.includes(k))
    return found ? found[1] : { label: status, cls: 'badge--type' }
}

function VoyageCard({ voyage, onClick }) {
    const badge = getBadge(voyage.status)
    return (
        <div className="card card--hover" onClick={() => onClick(voyage)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.75rem', flexWrap: 'wrap' }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.2rem' }}>{voyage.vessel_name}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>
                        {voyage.port_from_name} → {voyage.port_to_name}
                    </div>
                </div>
                <span className={`badge ${badge.cls}`}>{badge.label}</span>
            </div>
            <div style={{ marginTop: '.75rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                    <div className="detail-label">Departed</div>
                    <div style={{ fontSize: '.82rem' }}>{new Date(voyage.departure_time).toLocaleDateString()}</div>
                </div>
                {voyage.arrival_time && (
                    <div>
                        <div className="detail-label">Arrived</div>
                        <div style={{ fontSize: '.82rem' }}>{new Date(voyage.arrival_time).toLocaleDateString()}</div>
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

    return (
        <div style={{ display: 'grid', gap: '1.75rem', animation: 'fadeUp .38s ease both' }}>
            {/* Header */}
            <div>
                <h1 className="page-title">Voyage Replay</h1>
                <p className="page-subtitle">Select a voyage to replay its route and view events along the journey.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: voyage list */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <input
                        className="vessel-search-input"
                        style={{ width: '100%' }}
                        placeholder="Search vessel, port…"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                    {loading ? (
                        <div className="vessels-loading">Loading voyages…</div>
                    ) : filtered.length === 0 ? (
                        <div className="vessels-empty">No voyages found. Run <code>python manage.py seed_data</code> to populate data.</div>
                    ) : (
                        <div style={{ display: 'grid', gap: '.75rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '.25rem' }}>
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
