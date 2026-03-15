import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { fetchVessels, fetchSubscriptions, subscribeVessel, unsubscribeVessel } from '../services/vesselService'
import { useAuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { motion } from 'framer-motion'
import { Search, Filter, Ship, Crosshair, Star, Anchor, Eye, Bell, BellOff, Activity, Navigation } from 'lucide-react'
import SkeletonLoader from '../components/common/SkeletonLoader'

const VESSEL_TYPES = ['', 'Tanker', 'Cargo', 'Container Ship', 'Bulk Carrier', 'Passenger', 'Tug', 'Ferry', 'LNG Carrier', 'Ro-Ro', 'Chemical Tanker', 'Offshore Supply', 'Other']
const CARGO_TYPES = ['', 'Crude Oil', 'Refined Products', 'Chemicals', 'Dry Bulk', 'Containers', 'General Cargo', 'Liquefied Gas', 'Passengers', 'Iron Ore', 'Coal', 'Grain']
const PAGE_SIZE = 30

// Premium Vessel Card
const VesselCard = memo(function VesselCard({ vessel: v, isSubscribed, isToggling, isAuthenticated, onToggle }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{
                position: 'relative',
                background: isSubscribed ? 'radial-gradient(120% 120% at 50% 0%, rgba(56,189,248,0.12) 0%, rgba(255,255,255,0.02) 100%)' : 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
                border: `1px solid ${isSubscribed ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '16px',
                padding: '20px',
                overflow: 'hidden',
                backdropFilter: 'blur(16px)',
                boxShadow: isSubscribed ? '0 12px 32px rgba(56,189,248,0.15)' : '0 8px 24px rgba(0,0,0,0.3)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            whileHover={{ 
                y: -6, 
                borderColor: 'rgba(56,189,248,0.5)', 
                boxShadow: '0 20px 48px rgba(0,0,0,0.4), inset 0 0 24px rgba(56,189,248,0.08)' 
            }}
        >
            {/* Subtle top highlight for 3D effect */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: isSubscribed ? 'linear-gradient(90deg, transparent, rgba(56,189,248,0.6), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

            {/* Top row: vessel name + type badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.15))', border: '1px solid rgba(56,189,248,0.3)', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)' }}>
                        <Ship size={18} color="#38bdf8" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: '"Space Grotesk", sans-serif' }}>{v.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-2)', fontFamily: 'monospace', marginTop: '3px', letterSpacing: '0.02em' }}>IMO: <span style={{ color: 'var(--text-1)' }}>{v.imo_number}</span> &middot; {v.flag || '—'}</div>
                    </div>
                </div>
                <span style={{ flexShrink: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', padding: '4px 10px', borderRadius: '99px', background: 'rgba(99,102,241,0.15)', color: '#c4b5fd', border: '1px solid rgba(99,102,241,0.3)', textTransform: 'uppercase' }}>
                    {v.vessel_type || 'Unknown'}
                </span>
            </div>

            {/* Bottom rows: metadata grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' }}>Cargo Type</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-1)', fontWeight: 500 }}>{v.cargo_type || '—'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' }}>Destination</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-1)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.destination || '—'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' }}>Speed</div>
                    <div style={{ fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <Activity size={12} color="#38bdf8" />
                        {v.speed != null ? `${Number(v.speed).toFixed(1)} kn` : 'Unknown'}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' }}>Heading</div>
                    <div style={{ fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <Navigation size={12} color="#38bdf8" style={{ transform: `rotate(${v.heading || 0}deg)` }} />
                        {v.heading != null ? `${Number(v.heading).toFixed(0)}°` : '—'}
                    </div>
                </div>
            </div>

            {/* Position */}
            <div style={{ fontSize: '11px', color: 'var(--text-2)', fontFamily: 'monospace', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(90deg, rgba(34,211,238,0.1), transparent)', padding: '6px 10px', borderRadius: '6px', borderLeft: '2px solid var(--brand-cyan)' }}>
                <Crosshair size={12} color="var(--brand-cyan)" />
                {v.last_position_lat != null
                    ? `${Number(v.last_position_lat).toFixed(4)}°, ${Number(v.last_position_lon).toFixed(4)}°`
                    : 'Position unavailable'}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={`/vessels/${v.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                    <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #38bdf8, #6366f1)', color: '#040914', border: 'none', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(56,189,248,0.3)' }}
                    >
                        <Eye size={14} /> View Metadata
                    </motion.button>
                </Link>
                {isAuthenticated && (
                    <motion.button
                        whileHover={{ scale: 1.02, background: isSubscribed ? 'rgba(239,68,68,0.15)' : 'rgba(56,189,248,0.15)' }} 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onToggle(v.id)}
                        disabled={isToggling}
                        title={isSubscribed ? 'Unsubscribe from Vessel' : 'Subscribe to Vessel'}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            background: isSubscribed ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                            color: isSubscribed ? '#38bdf8' : 'var(--text-1)',
                            border: isSubscribed ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.12)',
                            padding: '9px 14px', borderRadius: '8px', cursor: isToggling ? 'wait' : 'pointer',
                            fontSize: '12px', fontWeight: 700, transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                    >
                        {isSubscribed ? <BellOff size={14} /> : <Bell size={14} />}
                        {isSubscribed ? 'Mute' : 'Track'}
                    </motion.button>
                )}
            </div>
        </motion.div>
    )
})

export default function VesselsPage() {
    const { isAuthenticated } = useAuthContext()
    const { addToast } = useToast()
<<<<<<< HEAD
=======

>>>>>>> 31b8725ea6237bd7730b9fe1ebd91572efda51dc
    const [allVessels, setAllVessels] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ name: '', type: '', flag: '', cargo_type: '', destination: '' })
    const [page, setPage] = useState(1)
<<<<<<< HEAD
=======

>>>>>>> 31b8725ea6237bd7730b9fe1ebd91572efda51dc
    const [subscribedIds, setSubscribedIds] = useState(new Set())
    const [togglingId, setTogglingId] = useState(null)

    const loadSubscriptions = useCallback(async () => {
        if (!isAuthenticated) return
        try {
            const subs = await fetchSubscriptions()
            setSubscribedIds(new Set(subs.map(s => s.vessel.id)))
        } catch {
<<<<<<< HEAD
            // silently fail
=======
            // ignore
>>>>>>> 31b8725ea6237bd7730b9fe1ebd91572efda51dc
        }
    }, [isAuthenticated])

    useEffect(() => {
        loadVessels()
        loadSubscriptions()
    }, [])

    const loadVessels = async () => {
        setLoading(true)
        try {
            setAllVessels(await fetchVessels({ page_size: 1000 }))
        } catch (err) {
            console.error('Failed to load vessels:', err)
        } finally {
            setLoading(false)
        }
    }

<<<<<<< HEAD
=======
    // Client-side filtering
>>>>>>> 31b8725ea6237bd7730b9fe1ebd91572efda51dc
    const filtered = useMemo(() => {
        return allVessels.filter(v => {
            if (filters.name && !v.name?.toLowerCase().includes(filters.name.toLowerCase()) && !v.imo_number?.includes(filters.name)) return false
            if (filters.type && v.vessel_type !== filters.type) return false
            if (filters.flag && !v.flag?.toLowerCase().includes(filters.flag.toLowerCase())) return false
            if (filters.cargo_type && v.cargo_type !== filters.cargo_type) return false
            if (filters.destination && !v.destination?.toLowerCase().includes(filters.destination.toLowerCase())) return false
            return true
        })
    }, [allVessels, filters])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const handleChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setPage(1)
    }
<<<<<<< HEAD
    const handleReset = () => { setFilters({ name: '', type: '', flag: '', cargo_type: '', destination: '' }); setPage(1) }
=======

    const handleReset = () => {
        setFilters({ name: '', type: '', flag: '', cargo_type: '', destination: '' })
        setPage(1)
    }
>>>>>>> 31b8725ea6237bd7730b9fe1ebd91572efda51dc

    const handleToggleSubscription = async (vesselId) => {
        if (!isAuthenticated || togglingId) return
        setTogglingId(vesselId)

        try {
            const isSubscribed = subscribedIds.has(vesselId)
            const vessel = allVessels.find(v => v.id === vesselId)
            const vesselName = vessel ? vessel.name : 'Vessel'
<<<<<<< HEAD
            if (isSubscribed) {
                await unsubscribeVessel(vesselId)
                setSubscribedIds(prev => { const next = new Set(prev); next.delete(vesselId); return next })
                addToast(`Vessel Subscription removed: ${vesselName}`, 'info')
            } else {
                await subscribeVessel(vesselId)
                setSubscribedIds(prev => new Set([...prev, vesselId]))
                addToast(`Vessel Subscription active: ${vesselName}`, 'success')
            }
        } catch (err) {
            console.error('Subscription toggle failed:', err)
            addToast('Subscription update failed. Please retry.', 'error')
=======

            if (isSubscribed) {
                await unsubscribeVessel(vesselId)
                setSubscribedIds(prev => {
                    const next = new Set(prev)
                    next.delete(vesselId)
                    return next
                })
                addToast(`Unsubscribed from ${vesselName}`, 'info')
            } else {
                await subscribeVessel(vesselId)
                setSubscribedIds(prev => new Set([...prev, vesselId]))
                addToast(`Subscribed to alerts for ${vesselName}`, 'success')
            }
        } catch (err) {
            console.error('Subscription toggle failed:', err)
            addToast('Failed to update subscription', 'error')
>>>>>>> 31b8725ea6237bd7730b9fe1ebd91572efda51dc
        } finally {
            setTogglingId(null)
        }
    }

    const inputStyle = {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px', padding: '0.5rem 0.9rem', color: '#fff', fontSize: '13px',
        outline: 'none', fontFamily: 'inherit', width: '100%',
    }

    return (
<<<<<<< HEAD
        <div style={{ paddingBottom: '3rem', display: 'grid', gap: '24px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '6px' }}>
                        <Ship color="#38bdf8" size={24} /> Live Vessel Tracking
                    </h1>
                    <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>
                        {loading ? 'Loading vessel registry...' : `Showing ${paginated.length} of ${filtered.length} vessels (${allVessels.length} total in registry)`}
                    </p>
                </div>
                <button
                    onClick={loadVessels}
                    disabled={loading}
                    style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)', padding: '0.5rem 1.1rem', borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* Filter Bar */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}
            >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '400px', height: '100%', background: 'linear-gradient(90deg, rgba(34,211,238,0.05), transparent)', pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '13px', paddingRight: '16px', borderRight: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, zIndex: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Filter size={16} /> Filters
                </div>
=======
        <div className="vessels-page">

            <div className="vessels-header">
                <div>
                    <h1>Vessel Database</h1>
                    <p className="vessels-subtitle">
                        {loading ? 'Loading...' : `${filtered.length} of ${allVessels.length} vessels`} · Global maritime registry
                    </p>
                </div>

                <button
                    className="btn btn--ghost btn--sm"
                    onClick={loadVessels}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : '⟳ Refresh'}
                </button>
            </div>

            {/* Filters */}
            <div className="vessel-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>

                <input
                    type="text"
                    name="name"
                    placeholder="🔍 Search name..."
                    value={filters.name}
                    onChange={handleChange}
                    className="vessel-search-input"
                />

                <select name="type" value={filters.type} onChange={handleChange} className="vessel-select">
                    {VESSEL_TYPES.map(t => (
                        <option key={t} value={t}>{t || 'All Types'}</option>
                    ))}
                </select>

                <input
                    type="text"
                    name="flag"
                    placeholder="Flag"
                    value={filters.flag}
                    onChange={handleChange}
                    className="vessel-search-input"
                />

                <select name="cargo_type" value={filters.cargo_type} onChange={handleChange} className="vessel-select">
                    {CARGO_TYPES.map(c => (
                        <option key={c} value={c}>{c || 'All Cargo'}</option>
                    ))}
                </select>

                <input
                    type="text"
                    name="destination"
                    placeholder="Destination"
                    value={filters.destination}
                    onChange={handleChange}
                    className="vessel-search-input"
                />

                <button className="btn btn--ghost btn--sm" onClick={handleReset}>
                    Clear
                </button>
            </div>
>>>>>>> 31b8725ea6237bd7730b9fe1ebd91572efda51dc

                <div style={{ position: 'relative', flex: '2', minWidth: '200px', zIndex: 1 }}>
                    <Search size={14} color="var(--text-2)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type="text" name="name" placeholder="Search by name or IMO..." value={filters.name} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '36px', background: 'rgba(0,0,0,0.2)' }} />
                </div>

                <select name="type" value={filters.type} onChange={handleChange} style={{ ...inputStyle, flex: 1, minWidth: '130px', appearance: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', zIndex: 1 }}>
                    {VESSEL_TYPES.map(t => <option key={t} value={t} style={{ background: 'var(--bg-1)' }}>{t || 'All Types'}</option>)}
                </select>

                <input type="text" name="flag" placeholder="Ship Flag..." value={filters.flag} onChange={handleChange} style={{ ...inputStyle, flex: 1, minWidth: '110px', background: 'rgba(0,0,0,0.2)', zIndex: 1 }} />

                <select name="cargo_type" value={filters.cargo_type} onChange={handleChange} style={{ ...inputStyle, flex: 1, minWidth: '130px', appearance: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', zIndex: 1 }}>
                    {CARGO_TYPES.map(c => <option key={c} value={c} style={{ background: 'var(--bg-1)' }}>{c || 'All Cargo'}</option>)}
                </select>

                <input type="text" name="destination" placeholder="Destination..." value={filters.destination} onChange={handleChange} style={{ ...inputStyle, flex: 1, minWidth: '120px', background: 'rgba(0,0,0,0.2)', zIndex: 1 }} />

                {(filters.name || filters.type || filters.flag || filters.cargo_type || filters.destination) && (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05, background: 'rgba(239,68,68,0.1)' }} whileTap={{ scale: 0.95 }}
                        onClick={handleReset} 
                        style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, flexShrink: 0, zIndex: 1, transition: 'all 0.2s' }}
                    >
                        Clear All
                    </motion.button>
                )}
            </motion.div>

            {/* Auth notice */}
            {!isAuthenticated && (
<<<<<<< HEAD
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#a5b4fc', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Star size={16} />
                    <span><Link to="/login" style={{ color: '#fff', fontWeight: 600 }}>Sign in</Link> to enable Vessel Subscription and receive event alerts.</span>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <SkeletonLoader type="card" count={9} />
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-2)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Anchor size={32} style={{ opacity: 0.4, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '14px' }}>No vessels found matching your filters.</p>
                    <button onClick={handleReset} style={{ marginTop: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        Reset Filters
                    </button>
                </div>
            ) : (
                <>
                    {/* Vessel Cards Grid */}
                    <motion.div
                        layout
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}
                    >
                        {paginated.map(v => (
                            <VesselCard
                                key={v.id}
                                vessel={v}
                                isSubscribed={subscribedIds.has(v.id)}
                                isToggling={togglingId === v.id}
                                isAuthenticated={isAuthenticated}
                                onToggle={handleToggleSubscription}
                            />
                        ))}
                    </motion.div>

                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>
                            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} vessels
                        </span>
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-1)', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontSize: '13px' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                                    let p = page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                                    if (p < 1) p = 1; if (p > totalPages) p = totalPages;
                                    return (
                                        <button key={p} onClick={() => setPage(p)}
                                            style={{ background: page === p ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)', border: page === p ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(255,255,255,0.08)', color: page === p ? '#38bdf8' : 'var(--text-1)', padding: '0.4rem 0.7rem', borderRadius: '8px', cursor: 'pointer', fontWeight: page === p ? 700 : 400, fontSize: '13px' }}
                                        >{p}</button>
                                    )
                                })}
                                <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-1)', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontSize: '13px' }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
                            </div>
                        )}
                    </div>
=======
                <div className="subscription-notice">
                    <Link to="/login">Sign in</Link> to subscribe to vessel alerts.
                </div>
            )}

            {loading ? (
                <div>Loading vessels...</div>
            ) : filtered.length === 0 ? (
                <div>No vessels found</div>
            ) : (
                <>
                    <table className="vessels-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>IMO</th>
                                <th>Type</th>
                                <th>Flag</th>
                                <th>Cargo</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginated.map((v, idx) => {
                                const isSubscribed = subscribedIds.has(v.id)

                                return (
                                    <tr key={v.id}>
                                        <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                        <td>{v.name}</td>
                                        <td>{v.imo_number}</td>
                                        <td>{v.vessel_type}</td>
                                        <td>{v.flag}</td>
                                        <td>{v.cargo_type}</td>

                                        <td>
                                            <Link to={`/vessels/${v.id}`} className="btn btn--ghost btn--sm">
                                                View
                                            </Link>

                                            {isAuthenticated && (
                                                <button
                                                    className="btn btn--sm"
                                                    onClick={() => handleToggleSubscription(v.id)}
                                                >
                                                    {isSubscribed ? 'Unsub' : 'Subscribe'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
>>>>>>> 31b8725ea6237bd7730b9fe1ebd91572efda51dc
                </>
            )}
        </div>
    )
}