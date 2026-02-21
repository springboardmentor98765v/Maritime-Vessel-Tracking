import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchVessels } from '../services/vesselService'
import api from '../services/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const shipIcon = new L.DivIcon({
    html: `<span style="font-size:22px;filter:drop-shadow(0 2px 4px #0008)">🚢</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    className: '',
})

const SEVERITY_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
}

export default function MapPage() {
    const [vessels, setVessels] = useState([])
    const [safetyEvents, setSafetyEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [showSafety, setShowSafety] = useState(true)
    const [lastRefreshed, setLastRefreshed] = useState(null)

    const loadData = async () => {
        setLoading(true)
        try {
            const [vesselData, safetyData] = await Promise.all([
                fetchVessels(),
                api.get('/safety-events/').then(r => r.data).catch(() => []),
            ])
            setVessels(vesselData.filter(v => v.last_position_lat != null && v.last_position_lon != null))
            setSafetyEvents(safetyData)
            setLastRefreshed(new Date().toLocaleTimeString())
        } catch (err) {
            console.error('Map load failed:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, 60_000)
        return () => clearInterval(interval)
    }, [])

    // Convert nautical miles to meters for Leaflet Circle radius
    const nmToMeters = nm => nm * 1852

    return (
        <div className="map-page">
            <div className="map-toolbar">
                <div className="map-toolbar-left">
                    <h1 className="map-title">🌊 Live Vessel Map</h1>
                    <span className="map-vessel-count">
                        {vessels.length} vessel{vessels.length !== 1 ? 's' : ''} with known position
                    </span>
                    {safetyEvents.length > 0 && (
                        <span className="map-vessel-count" style={{ color: '#f97316' }}>
                            · {safetyEvents.length} safety zone{safetyEvents.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <div className="map-toolbar-right">
                    {lastRefreshed && (
                        <span className="map-refresh-time">Updated: {lastRefreshed}</span>
                    )}
                    <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => setShowSafety(s => !s)}
                        style={{ borderColor: showSafety ? '#f97316' : undefined, color: showSafety ? '#f97316' : undefined }}
                    >
                        {showSafety ? '🛡 Hide Safety' : '🛡 Show Safety'}
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={loadData} disabled={loading}>
                        {loading ? 'Refreshing…' : '⟳ Refresh'}
                    </button>
                    <Link to="/vessels" className="btn btn--primary btn--sm">📋 Browse All</Link>
                </div>
            </div>

            <div className="map-container">
                {loading && vessels.length === 0 ? (
                    <div className="map-loading">Loading vessel positions…</div>
                ) : (
                    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Safety event circles */}
                        {showSafety && safetyEvents.map(ev => (
                            <Circle
                                key={ev.id}
                                center={[ev.latitude, ev.longitude]}
                                radius={nmToMeters(ev.radius_nm || 50)}
                                pathOptions={{
                                    color: SEVERITY_COLORS[ev.severity] || '#eab308',
                                    fillColor: SEVERITY_COLORS[ev.severity] || '#eab308',
                                    fillOpacity: 0.12,
                                    weight: 1.5,
                                    dashArray: '4 4',
                                }}
                            >
                                <Popup>
                                    <div className="map-popup">
                                        <strong>{ev.title}</strong>
                                        <p style={{ color: SEVERITY_COLORS[ev.severity], fontWeight: 700, textTransform: 'capitalize', margin: 0 }}>
                                            {ev.severity} · {ev.event_type}
                                        </p>
                                        {ev.description && <p>{ev.description}</p>}
                                        <p style={{ opacity: .6, margin: 0, fontSize: '.7rem' }}>
                                            Radius: {ev.radius_nm} nm · Source: {ev.source}
                                        </p>
                                    </div>
                                </Popup>
                            </Circle>
                        ))}

                        {/* Vessel markers */}
                        {vessels.map(v => (
                            <Marker
                                key={v.id}
                                position={[v.last_position_lat, v.last_position_lon]}
                                icon={shipIcon}
                            >
                                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>{v.name}</Tooltip>
                                <Popup>
                                    <div className="map-popup">
                                        <strong>{v.name}</strong>
                                        <p>IMO: <span className="mono">{v.imo_number}</span></p>
                                        <p>Type: {v.type}</p>
                                        <p>Flag: {v.flag}</p>
                                        <p>Cargo: {v.cargo_type}</p>
                                        {v.operator && <p>Operator: {v.operator}</p>}
                                        {v.last_update && (
                                            <p className="popup-time">Updated: {new Date(v.last_update).toLocaleString()}</p>
                                        )}
                                        <Link to={`/vessels/${v.id}`} className="popup-link">View Details →</Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    )
}
