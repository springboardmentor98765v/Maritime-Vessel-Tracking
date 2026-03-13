import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchVessels, fetchSubscriptions, subscribeVessel, unsubscribeVessel } from '../services/vesselService'
import { useAuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const VESSEL_TYPES = ['', 'Tanker', 'Cargo', 'Container Ship', 'Bulk Carrier', 'Passenger', 'Tug', 'Ferry', 'LNG Carrier', 'Ro-Ro', 'Chemical Tanker', 'Offshore Supply', 'Other']
const CARGO_TYPES = ['', 'Crude Oil', 'Refined Products', 'Chemicals', 'Dry Bulk', 'Containers', 'General Cargo', 'Liquefied Gas', 'Passengers', 'Iron Ore', 'Coal', 'Grain']
const PAGE_SIZE = 50

export default function VesselsPage() {
    const { isAuthenticated } = useAuthContext()
<<<<<<< Updated upstream
    const { addToast } = useToast()
    const [vessels, setVessels] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ name: '', type: '', flag: '', cargo_type: '' })
    // Set of subscribed vessel IDs for quick lookup
=======
    const [allVessels, setAllVessels] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ name: '', type: '', flag: '', cargo_type: '', destination: '' })
    const [page, setPage] = useState(1)
>>>>>>> Stashed changes
    const [subscribedIds, setSubscribedIds] = useState(new Set())
    const [togglingId, setTogglingId] = useState(null)

    const loadSubscriptions = useCallback(async () => {
        if (!isAuthenticated) return
        try {
            const subs = await fetchSubscriptions()
            setSubscribedIds(new Set(subs.map(s => s.vessel.id)))
        } catch {
            // silently fail — user might not be logged in
        }
    }, [isAuthenticated])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadVessels(); loadSubscriptions() }, [])

    const loadVessels = async () => {
        setLoading(true)
        try { setAllVessels(await fetchVessels({ page_size: 1000 })) }
        catch (err) { console.error('Failed to load vessels:', err) }
        finally { setLoading(false) }
    }

<<<<<<< Updated upstream
    const handleChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
    const handleSearch = (e) => { e.preventDefault(); loadVessels(filters) }
    const handleReset = () => { const c = { name: '', type: '', flag: '', cargo_type: '' }; setFilters(c); loadVessels(c) }
=======
    // Client-side filtering
    const filtered = useMemo(() => {
        return allVessels.filter(v => {
            if (filters.name && !v.name?.toLowerCase().includes(filters.name.toLowerCase())) return false
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
    const handleReset = () => { setFilters({ name: '', type: '', flag: '', cargo_type: '', destination: '' }); setPage(1) }
>>>>>>> Stashed changes

    const handleToggleSubscription = async (vesselId) => {
        if (!isAuthenticated || togglingId) return
        setTogglingId(vesselId)
        try {
            const isSubscribed = subscribedIds.has(vesselId)
<<<<<<< Updated upstream
            if (isSubscribed) {
                await unsubscribeVessel(vesselId)
                setSubscribedIds(prev => { const next = new Set(prev); next.delete(vesselId); return next })
                addToast('Unsubscribed from vessel alerts', 'info')
            } else {
                await subscribeVessel(vesselId)
                setSubscribedIds(prev => new Set([...prev, vesselId]))
                addToast('Subscribed to real-time vessel alerts', 'success')
            }
        } catch (err) {
            console.error('Subscription toggle failed:', err)
            addToast('Failed to update subscription', 'error')
=======
            const vessel = allVessels.find(v => v.id === vesselId)
            const vesselName = vessel ? vessel.name : 'Vessel'
            if (isSubscribed) {
                await unsubscribeVessel(vesselId)
                setSubscribedIds(prev => { const next = new Set(prev); next.delete(vesselId); return next })
                toast.success(`Unsubscribed from ${vesselName}`)
            } else {
                await subscribeVessel(vesselId)
                setSubscribedIds(prev => new Set([...prev, vesselId]))
                toast.success(`Subscribed to alerts for ${vesselName}`)
            }
        } catch (err) {
            console.error('Subscription toggle failed:', err)
            toast.error('Failed to update subscription. Please try again.')
>>>>>>> Stashed changes
        } finally {
            setTogglingId(null)
        }
    }

    return (
        <div className="vessels-page">
            <div className="vessels-header">
                <div>
                    <h1>Vessel Database</h1>
                    <p className="vessels-subtitle">
                        {loading ? 'Loading...' : `${filtered.length} of ${allVessels.length} vessels`} &middot; Global maritime registry
                    </p>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={loadVessels} disabled={loading}>
                    {loading ? 'Refreshing...' : '⟳ Refresh'}
                </button>
            </div>

<<<<<<< Updated upstream
            {/* Filter bar */}
            <form className="vessel-filters" onSubmit={handleSearch}>
=======
            {/* Filter bar — now client-side, instant results */}
            <div className="vessel-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
>>>>>>> Stashed changes
                <input className="vessel-search-input" type="text" name="name"
                    placeholder="🔍 Search name..." value={filters.name} onChange={handleChange} style={{ flex: 1, minWidth: 140 }} />
                <select name="type" value={filters.type} onChange={handleChange} className="vessel-select">
                    {VESSEL_TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
                </select>
                <input className="vessel-search-input" type="text" name="flag"
<<<<<<< Updated upstream
                    placeholder="Flag (e.g. Panama)" value={filters.flag} onChange={handleChange} style={{ maxWidth: 160 }} />
                <select name="cargo_type" value={filters.cargo_type} onChange={handleChange} className="vessel-select">
                    {CARGO_TYPES.map(c => <option key={c} value={c}>{c || 'All Cargo'}</option>)}
                </select>
                <button type="submit" className="btn btn--primary btn--sm">Search</button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={handleReset}>Reset</button>
            </form>
=======
                    placeholder="Flag (e.g. Panama)" value={filters.flag} onChange={handleChange} style={{ minWidth: 140 }} />
                <select name="cargo_type" value={filters.cargo_type} onChange={handleChange} className="vessel-select">
                    {CARGO_TYPES.map(c => <option key={c} value={c}>{c || 'All Cargo'}</option>)}
                </select>
                <input className="vessel-search-input" type="text" name="destination"
                    placeholder="Destination..." value={filters.destination} onChange={handleChange} style={{ minWidth: 130 }} />
                {(filters.name || filters.type || filters.flag || filters.cargo_type || filters.destination) && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={handleReset}>✕ Clear</button>
                )}
            </div>
>>>>>>> Stashed changes

            {!isAuthenticated && (
                <div className="subscription-notice">
                    <Link to="/login">Sign in</Link> to subscribe to vessel alerts and receive real-time notifications.
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div className="vessels-loading">Loading {allVessels.length > 0 ? allVessels.length : ''} vessels...</div>
            ) : filtered.length === 0 ? (
                <div className="vessels-empty">
                    <p>No vessels match your filters. <button className="btn btn--ghost btn--sm" onClick={handleReset}>Clear filters</button></p>
                </div>
            ) : (
                <>
                    <div className="vessels-table-wrap">
                        <table className="vessels-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>IMO</th>
                                    <th>Type</th>
                                    <th>Flag</th>
                                    <th>Cargo</th>
                                    <th>Operator</th>
                                    <th>Last Position</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((v, idx) => {
                                    const isSubscribed = subscribedIds.has(v.id)
                                    const isToggling = togglingId === v.id
                                    return (
                                        <tr key={v.id}>
                                            <td className="text-muted">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                            <td className="vessel-name">{v.name}</td>
                                            <td className="mono text-muted">{v.imo_number}</td>
                                            <td><span className="badge badge--type">{v.vessel_type}</span></td>
                                            <td>{v.flag}</td>
                                            <td>{v.cargo_type}</td>
                                            <td>{v.operator || <span className="text-muted">—</span>}</td>
                                            <td className="mono">
                                                {v.last_position_lat != null
                                                    ? `${Number(v.last_position_lat).toFixed(3)}, ${Number(v.last_position_lon).toFixed(3)}`
                                                    : <span className="text-muted">Unknown</span>}
                                            </td>
                                            <td className="vessel-actions">
                                                <Link to={`/vessels/${v.id}`} className="btn btn--ghost btn--sm">View</Link>
                                                {isAuthenticated && (
                                                    <button
                                                        className={`btn btn--sm ${isSubscribed ? 'btn--subscribed' : 'btn--subscribe'}`}
                                                        onClick={() => handleToggleSubscription(v.id)}
                                                        disabled={isToggling}
                                                        title={isSubscribed ? 'Unsubscribe from alerts' : 'Subscribe to alerts'}
                                                    >
                                                        {isToggling ? '...' : isSubscribed ? '★ Unsub' : '☆ Subscribe'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <span style={{ opacity: 0.6, fontSize: '0.82rem' }}>
                            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} vessels
                        </span>
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <button className="btn btn--ghost btn--sm" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                                <button className="btn btn--ghost btn--sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
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
                                <button className="btn btn--ghost btn--sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                                <button className="btn btn--ghost btn--sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
