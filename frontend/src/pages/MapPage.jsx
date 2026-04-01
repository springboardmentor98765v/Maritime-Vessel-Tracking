import React, { useState, useEffect, useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { fetchVessels } from '../services/vesselService'
import { fetchSafetyZones, fetchSafetyAlerts } from '../services/portService'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { formatFlagCountry } from '../utils/flags'
import { ShieldAlert, Layers, RefreshCw, Command, Target, Activity, MapPin } from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const shipIcon = new L.DivIcon({
    html: `<div style="width:16px; height:16px; background:var(--brand-cyan); border-radius:50%; border:2px solid #000; box-shadow:0 0 12px var(--brand-cyan);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: '',
})

const alertShipIcon = new L.DivIcon({
    html: `<div style="width:16px; height:16px; background:#ef4444; border-radius:50%; border:2px solid #000; box-shadow:0 0 16px #ef4444; animation:pulse 1.5s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: '',
})

const createClusterCustomIcon = function (cluster) {
    const count = cluster.getChildCount();
    let size = 34;
    if (count > 50) size = 48;
    else if (count > 20) size = 40;

    return new L.DivIcon({
        html: `<div title="${count} vessels in this area" style="width:${size}px; height:${size}px; background:rgba(4, 9, 20, 0.95); border:1.5px solid rgba(56,189,248,0.7); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:${count > 99 ? '0.65rem' : '0.8rem'}; box-shadow:0 0 14px rgba(56,189,248,0.35), inset 0 0 8px rgba(56,189,248,0.08); backdrop-filter:blur(8px); font-family:'Space Grotesk', sans-serif; gap:1px;">${count}<span style="font-size:0.5rem; font-weight:500; color:rgba(56,189,248,0.8); letter-spacing:0.02em; text-transform:uppercase;">vessels</span></div>`,
        className: 'custom-marker-cluster',
        iconSize: L.point(size, size, true),
    });
}

const SEVERITY_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
}

const ZONE_TYPE_COLORS = {
    storm: '#ef4444',
    cyclone: '#f97316',
    piracy: '#eab308',
    accident: '#a855f7',
    restricted: '#6366f1',
}

const ZONE_LABELS = {
    storm: 'Storm Cells',
    cyclone: 'Cyclone Activity',
    piracy: 'Piracy Risk Areas',
    accident: 'Accident Sites',
    restricted: 'Restricted Waters',
}

const VesselMarkers = memo(({ vessels, criticalVesselNames, alertShipIcon, shipIcon }) => {
    return vessels.map(v => {
        const icon = criticalVesselNames.has(v.name) ? alertShipIcon : shipIcon;
        return (
            <Marker key={v.id} position={[v.last_position_lat, v.last_position_lon]} icon={icon}>
                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">{v.name}</Tooltip>
                <Popup className="custom-popup">
                    <div style={{ padding: '0.25rem', minWidth: '180px' }}>
                        <strong style={{ fontSize: '1rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Target size={14} color="var(--brand-cyan)" /> {v.name}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-1)', marginTop: '8px', display: 'grid', gap: '4px' }}>
                            <div><strong style={{ color: 'var(--text-2)' }}>IMO:</strong> <span style={{ fontFamily: 'monospace' }}>{v.imo_number}</span></div>
                            <div><strong style={{ color: 'var(--text-2)' }}>TYPE:</strong> {v.vessel_type}</div>
                            <div><strong style={{ color: 'var(--text-2)' }}>FLAG:</strong> {v.flag ? formatFlagCountry(v.flag) : '—'}</div>
                            <div><strong style={{ color: 'var(--text-2)' }}>CARGO:</strong> {v.cargo_type || 'Unknown'}</div>
                            {v.last_update && (
                                <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)', color: 'var(--brand-cyan)', fontSize: '0.7rem' }}>
                                    <Activity size={10} style={{ display: 'inline' }} /> {new Date(v.last_update).toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                        <Link to={`/vessels/${v.id}`} style={{ display: 'block', textAlign: 'center', background: 'var(--surface-2)', border: '1px solid var(--border-hi)', padding: '6px', marginTop: '12px', borderRadius: '4px', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                            INITIALIZE TELEMETRY →
                        </Link>
                    </div>
                </Popup>
            </Marker>
        );
    });
});

export default function MapPage() {
    const [vessels, setVessels] = useState([])
    const [safetyEvents, setSafetyEvents] = useState([])
    const [safetyZones, setSafetyZones] = useState([])
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAlertPanel, setShowAlertPanel] = useState(false)

    const [layerToggles, setLayerToggles] = useState({
        storm: true,
        cyclone: true,
        piracy: true,
        accident: true,
        restricted: true,
    })

    const [showLegacySafety, setShowLegacySafety] = useState(true)

    const loadInitial = async () => {
        setLoading(true)
        try {
            const [vesselData, safetyData, zonesData, alertsData] = await Promise.all([
                fetchVessels({ page_size: 2000 }),
                api.get('/safety-events/').then(r => r.data).catch(() => []),
                fetchSafetyZones().catch(() => []),
                fetchSafetyAlerts().catch(() => []),
            ])
            setVessels(vesselData.filter(v => v.last_position_lat != null && v.last_position_lon != null))
            setSafetyEvents(safetyData)
            setSafetyZones(zonesData)
            setAlerts(alertsData)
        } catch (err) {
            console.error('Map load failed:', err)
        } finally {
            setLoading(false)
        }
    }

    // Silent background refresh — does NOT trigger loading spinner
    const refreshVessels = async () => {
        try {
            const vesselData = await fetchVessels({ page_size: 2000 })
            setVessels(vesselData.filter(v => v.last_position_lat != null && v.last_position_lon != null))
        } catch (err) {
            console.error('Vessel refresh failed:', err)
        }
    }

    useEffect(() => {
        loadInitial()
        const interval = setInterval(refreshVessels, 30000)
        return () => clearInterval(interval)
    }, [])

    const nmToMeters = nm => nm * 1852
    const kmToMeters = km => km * 1000

    const toggleLayer = (type) => setLayerToggles(prev => ({ ...prev, [type]: !prev[type] }))

    // Unique zone types present in data (from both sources)
   const allTypes = Object.keys(ZONE_LABELS)
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high')

    // Pre-compute a Set for O(1) lookups during vessel map rendering — avoids O(N*M) loop
    const criticalVesselNames = useMemo(
        () => new Set(criticalAlerts.map(a => a.vessel)),
        [criticalAlerts]
    )

    return (
        <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 120px)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            
            {/* Dark Map Base (CartoDB Dark Matter) */}
            <style>{`
                .leaflet-control-zoom-in,
                .leaflet-control-zoom-out,
                .leaflet-control-attribution {
                    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                }
                .leaflet-container {
                    background: #020617;
                    font-family: inherit;
                }
                .custom-popup .leaflet-popup-content-wrapper {
                    background: rgba(8, 17, 38, 0.95);
                    color: #fff;
                    border: 1px solid rgba(34,211,238,0.3);
                    border-radius: 8px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .custom-popup .leaflet-popup-tip {
                    background: rgba(8, 17, 38, 0.95);
                    border: 1px solid rgba(34,211,238,0.3);
                    border-top: none;
                    border-left: none;
                }
                .custom-tooltip {
                    background: rgba(0,0,0,0.8);
                    border: 1px solid var(--brand-cyan);
                    color: #fff;
                    font-weight: 600;
                    border-radius: 4px;
                    padding: 4px 8px;
                }
            `}</style>

            <MapContainer center={[15, 0]} zoom={3} style={{ height: '100%', width: '100%', zIndex: 1 }} scrollWheelZoom zoomControl={false} preferCanvas={true}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <ZoomControl position="bottomright" />

                {/* Milestone-3 Safety Zones circles */}
                {safetyZones.map(zone => {
                    if (!layerToggles[zone.zone_type]) return null
                    const color = ZONE_TYPE_COLORS[zone.zone_type] || '#eab308'
                    return (
                        <Circle
                            key={`sz-${zone.id}`}
                            center={[zone.latitude, zone.longitude]}
                            radius={kmToMeters(zone.radius || 100)}
                            pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 1.5, dashArray: '6 4' }}
                        >
                            <Popup className="custom-popup">
                                <div style={{ padding: '0.25rem' }}>
                                    <strong style={{ color, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <ShieldAlert size={16} /> {ZONE_LABELS[zone.zone_type] || zone.zone_type}
                                    </strong>
                                    <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', margin: '8px 0', fontSize: '0.8rem', borderLeft: `2px solid ${SEVERITY_COLORS[zone.severity]}` }}>
                                        <span style={{ color: 'var(--text-1)' }}>Severity Level:</span> <span style={{ color: SEVERITY_COLORS[zone.severity], fontWeight: 700, textTransform: 'uppercase' }}>{zone.severity}</span>
                                    </div>
                                    <p style={{ margin: '0', fontSize: '0.75rem', color: 'var(--text-2)', fontFamily: 'monospace' }}>
                                        Radius: {zone.radius}KM<br />
                                        {zone.expires_at && <>Expires: {new Date(zone.expires_at).toLocaleDateString()}</>}
                                    </p>
                                </div>
                            </Popup>
                        </Circle>
                    )
                })}

                {/* Legacy SafetyEvent circles */}
                {showLegacySafety && safetyEvents.map(ev => {
                    const color = SEVERITY_COLORS[ev.severity] || '#eab308'
                    return (
                        <Circle
                            key={ev.id}
                            center={[ev.latitude, ev.longitude]}
                            radius={nmToMeters(ev.radius_nm || 50)}
                            pathOptions={{ color: color, fillColor: color, fillOpacity: 0.12, weight: 1.5, dashArray: '4 4' }}
                        >
                            <Popup className="custom-popup">
                                <div style={{ padding: '0.25rem' }}>
                                    <strong style={{ color, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <ShieldAlert size={16} /> {ev.title}
                                    </strong>
                                    <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', margin: '8px 0', fontSize: '0.8rem', borderLeft: `2px solid ${color}` }}>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-1)', margin: '0' }}>{ev.description}</p>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-2)', fontFamily: 'monospace' }}>
                                        Radius: {ev.radius_nm} NM | Src: {ev.source}<br />
                                        {ev.active_until && <>Expires: {new Date(ev.active_until).toLocaleDateString()}</>}
                                    </p>
                                </div>
                            </Popup>
                        </Circle>
                    )
                })}

                {/* Vessel markers clustered */}
                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                    maxClusterRadius={80}
                    spiderfyOnMaxZoom={false}
                    showCoverageOnHover={false}
                    disableClusteringAtZoom={11}
                    animateAddingMarkers={false}
                >
                    <VesselMarkers 
                        vessels={vessels} 
                        criticalVesselNames={criticalVesselNames} 
                        alertShipIcon={alertShipIcon} 
                        shipIcon={shipIcon} 
                    />
                </MarkerClusterGroup>
            </MapContainer>

            {/* Overlays on top of Map */}
            
            {/* Top Bar HUD */}
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}
            >
                {/* Status Panel left */}
                <div style={{ background: 'rgba(4, 9, 20, 0.85)', border: '1px solid var(--border-hi)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Command color="var(--brand-cyan)" size={20} />
                        <div>
                            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff', lineHeight: 1 }}>Global Operations</h1>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-1)', letterSpacing: '0.05em' }}>{vessels.length} TARGETS ACQUIRED</span>
                        </div>
                    </div>
                </div>

                {/* Tools right */}
                <div style={{ display: 'flex', gap: '0.75rem', pointerEvents: 'auto' }}>
                    {criticalAlerts.length > 0 && (
                        <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAlertPanel(!showAlertPanel)}
                            style={{ background: showAlertPanel ? '#ef4444' : 'rgba(239, 68, 68, 0.15)', color: showAlertPanel ? '#fff' : '#fca5a5', border: `1px solid ${showAlertPanel ? '#ef4444' : 'rgba(239, 68, 68, 0.4)'}`, borderRadius: '8px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: showAlertPanel ? '0 0 20px rgba(239,68,68,0.4)' : '0 4px 12px rgba(239,68,68,0.1)' }}
                        >
                            <ShieldAlert size={16} /> {criticalAlerts.length} PROTOCOL BREACHES
                        </motion.button>
                    )}
                    <button 
                        onClick={loadInitial} disabled={loading}
                        style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--brand-cyan)', border: '1px solid rgba(34, 211, 238, 0.3)', borderRadius: '8px', width: '40px', height: '40px', display: 'grid', placeItems: 'center', cursor: loading ? 'wait' : 'pointer', }}
                    >
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                    </button>
                </div>
            </motion.div>

            {/* Bottom Layers Panel */}
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 1000, background: 'rgba(4, 9, 20, 0.85)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', width: '280px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={14} color="var(--brand-cyan)" /> TACTICAL OVERLAYS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {allTypes.map(type => (
                        <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-1)' }}>
                            <input type="checkbox" checked={layerToggles[type] ?? true} onChange={() => toggleLayer(type)} style={{ accentColor: ZONE_TYPE_COLORS[type] || 'var(--brand-cyan)' }} />
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ZONE_TYPE_COLORS[type] || 'var(--brand-cyan)' }} />
                            {ZONE_LABELS[type] || type}
                        </label>
                    ))}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-1)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <input type="checkbox" checked={showLegacySafety} onChange={() => setShowLegacySafety(p => !p)} style={{ accentColor: '#f97316' }} />
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
                        Legacy Safety Events
                    </label>
                </div>
            </motion.div>

            {/* Floating Risk Alerts Panel */}
            <AnimatePresence>
                {showAlertPanel && criticalAlerts.length > 0 && (
                    <motion.div 
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ position: 'absolute', top: '70px', right: '16px', zIndex: 1000, background: 'rgba(8, 17, 38, 0.95)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', width: '320px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 200px)' }}
                    >
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldAlert size={16} /> PRIORITY ALERTS
                            </span>
                            <button onClick={() => setShowAlertPanel(false)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ padding: '0.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {criticalAlerts.slice(0, 20).map((a, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${SEVERITY_COLORS[a.severity]}30`, borderLeft: `3px solid ${SEVERITY_COLORS[a.severity]}`, borderRadius: '6px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: SEVERITY_COLORS[a.severity], background: `${SEVERITY_COLORS[a.severity]}15`, padding: '2px 6px', borderRadius: '4px' }}>
                                            {a.severity.toUpperCase()} ALERT
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-1)' }}>{a.risk}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>TGT: {a.vessel}</div>
                                    {a.distance_km && <div style={{ fontSize: '0.75rem', color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12}/> PROXIMITY: {a.distance_km} KM</div>}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

