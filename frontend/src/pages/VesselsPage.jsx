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
    const { addToast } = useToast()

    const [allVessels, setAllVessels] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ name: '', type: '', flag: '', cargo_type: '', destination: '' })
    const [page, setPage] = useState(1)

    const [subscribedIds, setSubscribedIds] = useState(new Set())
    const [togglingId, setTogglingId] = useState(null)

    const loadSubscriptions = useCallback(async () => {
        if (!isAuthenticated) return
        try {
            const subs = await fetchSubscriptions()
            setSubscribedIds(new Set(subs.map(s => s.vessel.id)))
        } catch {
            // ignore
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

    const handleReset = () => {
        setFilters({ name: '', type: '', flag: '', cargo_type: '', destination: '' })
        setPage(1)
    }

    const handleToggleSubscription = async (vesselId) => {
        if (!isAuthenticated || togglingId) return
        setTogglingId(vesselId)

        try {
            const isSubscribed = subscribedIds.has(vesselId)
            const vessel = allVessels.find(v => v.id === vesselId)
            const vesselName = vessel ? vessel.name : 'Vessel'

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

            {!isAuthenticated && (
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
                </>
            )}
        </div>
    )
}