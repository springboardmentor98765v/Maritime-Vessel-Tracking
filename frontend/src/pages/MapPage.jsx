import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchVessels } from '../services/vesselService'
import { fetchSafetyZones, fetchSafetyAlerts } from '../services/portService'
import api from '../services/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const shipIcon = new L.DivIcon({
    html: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 4px #0008)">
      <path d="M10 2L14 8H6L10 2Z" fill="#22d3ee"/>
      <rect x="8" y="8" width="4" height="8" fill="#22d3ee"/>
      <path d="M4 14H16L13 18H7L4 14Z" fill="#0ea5e9"/>
    </svg>`,
    iconSize: [20, 20],
    iconAnchor: [10, 18],
    className: '',
})

const SEVERITY_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
}

// Colors per zone type
const ZONE_TYPE_COLORS = {
    storm: '#ef4444',  // red
    cyclone: '#f97316',  // orange
    piracy: '#eab308',  // yellow
    accident: '#a855f7',  // purple
    restricted: '#6366f1',  // indigo
}

// Human labels
const ZONE_LABELS = {
    storm: 'Storm Zones',
    cyclone: 'Cyclone Zones',
    piracy: 'Piracy Zones',
    accident: 'Accident Areas',
    restricted: 'Restricted Areas',
}

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 }

export default function MapPage() {
    const [vessels, setVessels] = useState([])
    const [safetyEvents, setSafetyEvents] = useState([])   // legacy SafetyEvent overlays
    const [safetyZones, setSafetyZones] = useState([])     // Milestone-3 SafetyZones
    const [alerts, setAlerts] = useState([])               // risk alerts
    const [loading, setLoading] = useState(true)
    const [lastRefreshed, setLastRefreshed] = useState(null)
    const [showAlertPanel, setShowAlertPanel] = useState(false)

    // Per-type toggle state — all on by default
    const [layerToggles, setLayerToggles] = useState({
        storm: true,
        cyclone: true,
        piracy: true,
        accident: true,
        restricted: true,
    })

    // Also keep legacy showSafety toggle for backward-compat overlay
    const [showLegacySafety, setShowLegacySafety] = useState(true)

    const loadData = async () => {
        setLoading(true)
        try {
<<<<<<< Updated upstream
            const [vesselData, safetyData, zonesData, alertsData] = await Promise.all([
                fetchVessels(),
=======
            const [vesselData, safetyData] = await Promise.all([
                fetchVessels({ page_size: 1000 }),
>>>>>>> Stashed changes
                api.get('/safety-events/').then(r => r.data).catch(() => []),
                fetchSafetyZones().catch(() => []),
                fetchSafetyAlerts().catch(() => []),
            ])
            setVessels(vesselData.filter(v => v.last_position_lat != null && v.last_position_lon != null))
            setSafetyEvents(safetyData)
            setSafetyZones(zonesData)
            setAlerts(alertsData)
            setLastRefreshed(new Date().toLocaleTimeString())
        } catch (err) {
            console.error('Map load failed:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, 10_000)
        return () => clearInterval(interval)
    }, [])

    const nmToMeters = nm => nm * 1852
    const kmToMeters = km => km * 1000

    const toggleLayer = (type) => setLayerToggles(prev => ({ ...prev, [type]: !prev[type] }))

    // Unique zone types present in data (from both sources)
    const allTypes = [...new Set([
        ...safetyZones.map(z => z.zone_type),
        ...safetyEvents.map(e => e.event_type),
    ])].filter(t => ZONE_LABELS[t])

    const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high')

    return (
        <div className="map-page">
            <div className="map-toolbar">
                <div className="map-toolbar-left">
                    <h1 className="map-title">Live Vessel Map</h1>
                    <span className="map-vessel-count">
                        {vessels.length} vessel{vessels.length !== 1 ? 's' : ''} with known position
                    </span>
                    {criticalAlerts.length > 0 && (
                        <span
                            className="map-vessel-count"
                            style={{ color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
                            onClick={() => setShowAlertPanel(p => !p)}
                        >
                            &nbsp;⚠ {criticalAlerts.length} risk alert{criticalAlerts.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <div className="map-toolbar-right">
                    {lastRefreshed && (
                        <span className="map-refresh-time">Updated: {lastRefreshed}</span>
                    )}
                    {criticalAlerts.length > 0 && (
                        <button
                            className="btn btn--sm"
                            style={{ borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => setShowAlertPanel(p => !p)}
                        >
                            {showAlertPanel ? 'Hide Alerts' : `⚠ Alerts (${criticalAlerts.length})`}
                        </button>
                    )}
                    <button className="btn btn--ghost btn--sm" onClick={loadData} disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <Link to="/vessels" className="btn btn--primary btn--sm">Browse Vessels</Link>
                </div>
            </div>

            {/* Overlay Layer Toggles */}
            <div className="map-layer-controls">
                <span style={{ color: '#64748b', fontSize: 12, marginRight: 8 }}>Overlays:</span>
                {allTypes.map(type => (
                    <label key={type} className="map-layer-toggle">
                        <input
                            type="checkbox"
                            checked={layerToggles[type] ?? true}
                            onChange={() => toggleLayer(type)}
                        />
                        <span
                            className="map-layer-dot"
                            style={{ background: ZONE_TYPE_COLORS[type] || '#888' }}
                        />
                        {ZONE_LABELS[type] || type}
                    </label>
                ))}
                {/* Legacy toggle for old safety events */}
                <label className="map-layer-toggle">
                    <input
                        type="checkbox"
                        checked={showLegacySafety}
                        onChange={() => setShowLegacySafety(p => !p)}
                    />
                    <span className="map-layer-dot" style={{ background: '#f97316' }} />
                    Safety Events
                </label>
            </div>

            {/* Risk Alert Panel */}
            {showAlertPanel && criticalAlerts.length > 0 && (
                <div className="alert-panel">
                    <div className="alert-panel-header">
                        <span>⚠ Active Risk Alerts</span>
                        <button className="alert-panel-close" onClick={() => setShowAlertPanel(false)}>✕</button>
                    </div>
                    <div className="alert-panel-list">
                        {criticalAlerts.slice(0, 20).map((a, idx) => (
                            <div key={idx} className={`alert-item alert-item--${a.severity}`}>
                                <div className="alert-item-header">
                                    <span className="alert-badge" style={{
                                        background: SEVERITY_COLORS[a.severity] + '22',
                                        color: SEVERITY_COLORS[a.severity],
                                        border: `1px solid ${SEVERITY_COLORS[a.severity]}44`,
                                    }}>
                                        {a.severity?.toUpperCase()}
                                    </span>
                                    <span className="alert-risk">{a.risk}</span>
                                </div>
                                <div className="alert-vessel">
                                    Vessel: <strong>{a.vessel}</strong>
                                </div>
                                {a.distance_km && (
                                    <div className="alert-dist">{a.distance_km} km from zone center</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="map-container">
                {loading && vessels.length === 0 ? (
                    <div className="map-loading">Loading vessel positions…</div>
                ) : (
                    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Milestone-3 Safety Zones circles (per-type toggle) */}
                        {safetyZones.map(zone => {
                            if (!layerToggles[zone.zone_type]) return null
                            const color = ZONE_TYPE_COLORS[zone.zone_type] || '#eab308'
                            return (
                                <Circle
                                    key={`sz-${zone.id}`}
                                    center={[zone.latitude, zone.longitude]}
                                    radius={kmToMeters(zone.radius || 100)}
                                    pathOptions={{
                                        color,
                                        fillColor: color,
                                        fillOpacity: 0.13,
                                        weight: 2,
                                        dashArray: '6 3',
                                    }}
                                >
                                    <Popup>
                                        <div className="map-popup">
                                            <strong style={{ color }}>{ZONE_LABELS[zone.zone_type] || zone.zone_type}</strong>
                                            <p style={{ color: SEVERITY_COLORS[zone.severity] || '#eab308', fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>
                                                Severity: {zone.severity}
                                            </p>
                                            <p style={{ opacity: .6, margin: 0, fontSize: '.7rem' }}>
                                                Radius: {zone.radius} km
                                                {zone.expires_at && <><br />Expires: {new Date(zone.expires_at).toLocaleDateString()}</>}
                                            </p>
                                        </div>
                                    </Popup>
                                </Circle>
                            )
                        })}

                        {/* Legacy SafetyEvent circles */}
                        {showLegacySafety && safetyEvents.map(ev => (
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
                                        <p>Type: {v.vessel_type}</p>
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
