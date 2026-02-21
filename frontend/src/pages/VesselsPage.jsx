import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchVessels } from '../services/vesselService'

const VESSEL_TYPES = ['', 'Tanker', 'Cargo', 'Container', 'Bulk Carrier', 'Passenger', 'Tug', 'Ferry', 'Other']
const CARGO_TYPES = ['', 'Oil', 'Gas', 'Chemicals', 'Dry Bulk', 'Containers', 'General', 'Passengers']

export default function VesselsPage() {
    const [vessels, setVessels] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ name: '', type: '', flag: '', cargo_type: '' })

    useEffect(() => { loadVessels() }, [])

    const loadVessels = async (f = filters) => {
        setLoading(true)
        try { setVessels(await fetchVessels(f)) }
        catch (err) { console.error('Failed to load vessels:', err) }
        finally { setLoading(false) }
    }

    const handleChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
    const handleSearch = (e) => { e.preventDefault(); loadVessels(filters) }
    const handleReset = () => { const c = { name: '', type: '', flag: '', cargo_type: '' }; setFilters(c); loadVessels(c) }

    return (
        <div className="vessels-page">
            <div className="vessels-header">
                <h1>Vessel Database</h1>
                <p className="vessels-subtitle">Search and filter the global vessel registry</p>
            </div>

            {/* Filter bar */}
            <form className="vessel-filters" onSubmit={handleSearch}>
                <input className="vessel-search-input" type="text" name="name"
                    placeholder="🔍  Search by name…" value={filters.name} onChange={handleChange} />
                <select name="type" value={filters.type} onChange={handleChange} className="vessel-select">
                    {VESSEL_TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
                </select>
                <input className="vessel-search-input" type="text" name="flag"
                    placeholder="Flag (e.g. Panama)" value={filters.flag} onChange={handleChange} style={{ maxWidth: 160 }} />
                <select name="cargo_type" value={filters.cargo_type} onChange={handleChange} className="vessel-select">
                    {CARGO_TYPES.map(c => <option key={c} value={c}>{c || 'All Cargo'}</option>)}
                </select>
                <button type="submit" className="btn btn--primary btn--sm">Search</button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={handleReset}>Reset</button>
            </form>

            {/* Results */}
            {loading ? (
                <div className="vessels-loading">⏳ Loading vessels…</div>
            ) : vessels.length === 0 ? (
                <div className="vessels-empty">
                    <p>No vessels found. Try different filters or seed data via the admin panel.</p>
                </div>
            ) : (
                <div className="vessels-table-wrap">
                    <table className="vessels-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>IMO</th>
                                <th>Type</th>
                                <th>Flag</th>
                                <th>Cargo</th>
                                <th>Operator</th>
                                <th>Last Position</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {vessels.map(v => (
                                <tr key={v.id}>
                                    <td className="vessel-name">{v.name}</td>
                                    <td className="mono text-muted">{v.imo_number}</td>
                                    <td><span className="badge badge--type">{v.type}</span></td>
                                    <td>{v.flag}</td>
                                    <td>{v.cargo_type}</td>
                                    <td>{v.operator || <span className="text-muted">—</span>}</td>
                                    <td className="mono">
                                        {v.last_position_lat != null
                                            ? `${Number(v.last_position_lat).toFixed(3)}°, ${Number(v.last_position_lon).toFixed(3)}°`
                                            : <span className="text-muted">Unknown</span>}
                                    </td>
                                    <td>
                                        <Link to={`/vessels/${v.id}`} className="btn btn--ghost btn--sm">View →</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="vessels-count">{vessels.length} vessel{vessels.length !== 1 ? 's' : ''} found</div>
                </div>
            )}
        </div>
    )
}
