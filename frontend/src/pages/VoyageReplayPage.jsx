import { useState, useEffect, memo } from 'react'
import { Anchor, Ship, ArrowRight, Clock, Calendar, Play, Pause, SkipForward, SkipBack, PlayCircle, Navigation, MapPin, Crosshair } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const STATUS_CFG = {
    completed: { label: 'Completed', bg: 'rgba(34,197,94,0.12)', color: '#86efac', border: 'rgba(34,197,94,0.28)', dot: '#22c55e' },
    in_transit: { label: 'In Transit', bg: 'rgba(56,189,248,0.12)', color: '#7dd3fc', border: 'rgba(56,189,248,0.28)', dot: '#38bdf8' },
    delayed: { label: 'Delayed', bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: 'rgba(245,158,11,0.28)', dot: '#f59e0b' },
    cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: 'rgba(239,68,68,0.28)', dot: '#ef4444' },
}

function getStatus(status) {
    const s = (status || '').toLowerCase()
    const found = Object.entries(STATUS_CFG).find(([k]) => s.includes(k))
    return found ? found[1] : { label: status, bg: 'rgba(255,255,255,0.05)', color: 'var(--text-1)', border: 'rgba(255,255,255,0.1)', dot: '#94a3b8' }
}

const VoyageCard = memo(function VoyageCard({ voyage, isSelected, onClick }) {
    const status = getStatus(voyage.status)
    const progress = voyage.status?.toLowerCase().includes('completed') ? 100
        : voyage.status?.toLowerCase().includes('in_transit') ? 55
        : voyage.status?.toLowerCase().includes('delayed') ? 40
        : 0

    return (
        <motion.div
            onClick={() => onClick(voyage)}
            whileHover={{ y: -3, borderColor: isSelected ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.14)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}
            style={{
                cursor: 'pointer',
                background: isSelected
                    ? 'linear-gradient(160deg, rgba(34,211,238,0.12) 0%, rgba(8,17,38,0.95) 100%)'
                    : 'linear-gradient(160deg, rgba(16,26,52,0.85) 0%, rgba(8,14,30,0.95) 100%)',
                border: `1px solid ${isSelected ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(12px)',
                boxShadow: isSelected ? '0 12px 36px rgba(34,211,238,0.2), 0 4px 12px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s',
            }}
        >
            {isSelected && <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.7), transparent)' }} />}

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', display: 'grid', placeItems: 'center' }}>
                        <Ship size={14} color="#22d3ee" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff', fontFamily: '"Space Grotesk", sans-serif' }}>{voyage.vessel_name}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '99px', background: status.bg, color: status.color, border: `1px solid ${status.border}`, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: status.dot, boxShadow: `0 0 6px ${status.dot}` }} />{status.label}
                </span>
            </div>

            {/* Route bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.5)', fontSize: '12px', flexShrink: 0 }}>
                    <Anchor size={12} /><span>{voyage.port_from_name || 'Origin'}</span>
                </div>
                <div style={{ flex: 1, position: 'relative', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'visible' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #22d3ee, #6366f1)', borderRadius: '99px', boxShadow: '0 0 8px rgba(34,211,238,0.4)' }} />
                    {progress > 0 && progress < 100 && (
                        <div style={{ position: 'absolute', top: '50%', left: `${progress}%`, transform: 'translate(-50%, -50%)', width: 10, height: 10, borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px #22d3ee' }} />
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.5)', fontSize: '12px', flexShrink: 0 }}>
                    <Anchor size={12} /><span>{voyage.port_to_name || 'Destination'}</span>
                </div>
            </div>

            {/* Dates row */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    <Calendar size={11} /><span>{new Date(voyage.departure_time).toLocaleDateString()}</span>
                </div>
                {voyage.arrival_time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        <Clock size={11} /><span>ETA: {new Date(voyage.arrival_time).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </motion.div>
    )
})

function ReplayPanel({ voyage, onClose }) {
    const [replay, setReplay] = useState(null)
    const [step, setStep] = useState(0)
    const [playing, setPlaying] = useState(false)
    const [speed, setSpeed] = useState(1)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReplay(null)
        setStep(0)
        setPlaying(false)
        api.get(`/voyages/${voyage.id}/history/`)
            .then(r => { setReplay(r.data); setStep(0) })
            .catch(console.error)
    }, [voyage.id])

    useEffect(() => {
        if (!playing || !replay) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (step >= replay.waypoints.length - 1) { setPlaying(false); return }
        const t = setTimeout(() => setStep(s => s + 1), 1200 / speed)
        return () => clearTimeout(t)
    }, [playing, step, replay, speed])

    if (!replay) return (
        <div style={{ background: 'rgba(8,17,38,0.85)', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(34,211,238,0.2)', borderTopColor: '#22d3ee', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <div style={{ color: '#22d3ee', fontSize: '0.85rem', fontWeight: 600 }}>LOADING TELEMETRY...</div>
        </div>
    )

    const current = replay.waypoints[step]
    const total = replay.waypoints.length
    const progressPercent = total > 1 ? (step / (total - 1)) * 100 : 0
    const wpTypeColor = current.type === 'departure' ? '#22c55e' : current.type === 'arrival' ? '#22d3ee' : '#f59e0b'

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ position: 'sticky', top: '90px', background: 'linear-gradient(160deg, rgba(12,22,46,0.97) 0%, rgba(6,12,28,0.99) 100%)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.1)' }}
        >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34,211,238,0.04)' }}>
                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PlayCircle size={18} color="#22d3ee" /> Voyage Replay
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0', fontFamily: 'monospace' }}>
                        {replay.voyage.vessel_name} · {replay.voyage.port_from_name} → {replay.voyage.port_to_name}
                    </p>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>✕ Close</button>
            </div>

            {/* Progress Track */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                    <span>Step {step + 1} of {total}</span>
                    <span style={{ color: '#22d3ee', fontWeight: 700 }}>{Math.round(progressPercent)}% Complete</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
                    <motion.div
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: 'linear-gradient(90deg, #22d3ee, #6366f1)', borderRadius: '99px', boxShadow: '0 0 12px rgba(34,211,238,0.5)' }}
                    />
                </div>
                {/* Dots */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingInline: '2px' }}>
                    {replay.waypoints.map((wp, i) => (
                        <button
                            key={i}
                            onClick={() => setStep(i)}
                            title={wp.label}
                            style={{
                                width: i === 0 || i === total - 1 ? 14 : 10,
                                height: i === 0 || i === total - 1 ? 14 : 10,
                                borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, padding: 0,
                                background: i <= step
                                    ? (wp.type === 'departure' ? '#22c55e' : wp.type === 'arrival' ? '#22d3ee' : '#f59e0b')
                                    : 'rgba(255,255,255,0.15)',
                                boxShadow: i === step ? `0 0 10px ${wpTypeColor}` : 'none',
                                transform: i === step ? 'scale(1.3)' : 'scale(1)',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Current Waypoint */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{ background: `${wpTypeColor}0d`, border: `1px solid ${wpTypeColor}25`, borderRadius: '12px', padding: '1rem 1.25rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', color: wpTypeColor, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: wpTypeColor, boxShadow: `0 0 8px ${wpTypeColor}` }} />
                                {current.type === 'departure' ? 'Departure Point' : current.type === 'arrival' ? 'Arrival Port' : 'Route Event'}
                            </span>
                            {current.timestamp && (
                                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
                                    {new Date(current.timestamp).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: current.details ? '6px' : 0, fontFamily: '"Space Grotesk", sans-serif' }}>{current.label}</div>
                        {current.details && <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{current.details}</p>}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: step === 0 ? 'rgba(255,255,255,0.2)' : '#fff', borderRadius: '8px', padding: '0.5rem 0.65rem', cursor: step === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                    <SkipBack size={14} />
                </button>
                <button
                    onClick={() => { if (step >= total - 1) setStep(0); else setPlaying(p => !p) }}
                    style={{ background: playing ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg, #22d3ee, #6366f1)', border: playing ? '1px solid rgba(239,68,68,0.3)' : 'none', color: playing ? '#fca5a5' : '#040914', borderRadius: '10px', padding: '0.55rem 1.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: playing ? 'none' : '0 4px 12px rgba(34,211,238,0.3)' }}>
                    {playing ? <><Pause size={14} /> Pause</> : step >= total - 1 ? <><SkipBack size={14} /> Restart</> : <><Play size={14} /> Play</>}
                </button>
                <button onClick={() => setStep(s => Math.min(total - 1, s + 1))} disabled={step >= total - 1}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: step >= total - 1 ? 'rgba(255,255,255,0.2)' : '#fff', borderRadius: '8px', padding: '0.5rem 0.65rem', cursor: step >= total - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                    <SkipForward size={14} />
                </button>

                <div style={{ marginLeft: '0.75rem', display: 'flex', gap: '3px', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {[1, 2, 4].map(s => (
                        <button key={s} onClick={() => setSpeed(s)} style={{ background: speed === s ? 'rgba(34,211,238,0.15)' : 'transparent', border: speed === s ? '1px solid rgba(34,211,238,0.3)' : '1px solid transparent', color: speed === s ? '#22d3ee' : 'rgba(255,255,255,0.4)', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>{s}x</button>
                    ))}
                </div>
            </div>

            {replay.vessel_last_lat && (
                <div style={{ padding: '0 1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                    <Crosshair size={12} color="#22d3ee" />
                    Last known: {Number(replay.vessel_last_lat).toFixed(4)}°, {Number(replay.vessel_last_lon).toFixed(4)}°
                </div>
            )}
        </motion.div>
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
        !filter ||
        v.vessel_name?.toLowerCase().includes(filter.toLowerCase()) ||
        v.port_from_name?.toLowerCase().includes(filter.toLowerCase()) ||
        v.port_to_name?.toLowerCase().includes(filter.toLowerCase())
    )

    const stats = {
        total: voyages.length,
        active: voyages.filter(v => v.status?.toLowerCase().includes('in_transit')).length,
        completed: voyages.filter(v => v.status?.toLowerCase().includes('completed')).length,
        delayed: voyages.filter(v => v.status?.toLowerCase().includes('delayed')).length,
    }

    const statRows = [
        { label: 'Total Voyages', value: stats.total, color: '#38bdf8' },
        { label: 'In Transit', value: stats.active, color: '#7dd3fc' },
        { label: 'Completed', value: stats.completed, color: '#86efac' },
        { label: 'Delayed', value: stats.delayed, color: '#fcd34d' },
    ]

    return (
        <div style={{ display: 'grid', gap: '1.75rem', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title"><PlayCircle size={28} color="var(--brand-cyan)" /> Voyage Replay</h1>
                    <p className="page-subtitle">Select any voyage to replay its route and view waypoint events in real time.</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Navigation size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        placeholder="Search vessel or port…"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.7rem 1rem 0.7rem 2.5rem', color: '#fff', fontSize: '0.9rem', outline: 'none', width: '280px', transition: 'border 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                </div>
            </div>

            {/* Stats Row */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                    {statRows.map(stat => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -3, borderColor: `${stat.color}40` }}
                            style={{ background: 'rgba(8,17,38,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', backdropFilter: 'blur(12px)', cursor: 'default', transition: 'all 0.2s' }}
                        >
                            <div style={{ width: 4, height: 36, borderRadius: 99, background: stat.color, flexShrink: 0, boxShadow: `0 0 12px ${stat.color}80` }} />
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>{stat.value}</div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '4px' }}>{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: voyage list */}
                <div>
                    {loading ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} style={{ height: '110px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', animation: 'pulseOpacity 1.5s infinite', animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '16px', color: 'rgba(255,255,255,0.4)' }}>
                            <Ship size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No voyages found matching your search.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.85rem', maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' }}>
                            {filtered.slice(0, 100).map(v => (
                                <VoyageCard
                                    key={v.id}
                                    voyage={v}
                                    isSelected={selected?.id === v.id}
                                    onClick={voy => setSelected(voy.id === selected?.id ? null : voy)}
                                />
                            ))}
                            {filtered.length > 100 && (
                                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', padding: '1rem' }}>
                                    Showing 100 of {filtered.length} voyages
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: replay panel */}
                <AnimatePresence>
                    {selected && (
                        <ReplayPanel key={selected.id} voyage={selected} onClose={() => setSelected(null)} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
