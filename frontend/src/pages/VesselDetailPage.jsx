import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchVessel,
    fetchVesselEvents,
    subscribeVessel,
    unsubscribeVessel,
    fetchSubscriptions,
    fetchVesselHistory,
} from "../services/vesselService";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from 'framer-motion';
import { formatFlagCountry } from '../utils/flags';
import { ArrowLeft, Ship, MapPin, Compass, Navigation, Activity, Box, Map, AlertTriangle, ShieldCheck, Database, Calendar, Anchor, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom cyan ship icon for detail page
const vesselDetailIcon = L.divIcon({
    html: `<div style="
        width:18px;height:18px;border-radius:50%;
        background:rgba(34,211,238,0.25);
        border:2px solid #22d3ee;
        box-shadow:0 0 14px rgba(34,211,238,0.8), 0 0 4px rgba(34,211,238,1);
        display:flex;align-items:center;justify-content:center;
    "><div style="width:6px;height:6px;border-radius:50%;background:#22d3ee;"></div></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: '',
});

// Helper: fly to vessel position on mount
function FlyTo({ lat, lon }) {
    const map = useMap();
    useEffect(() => { map.setView([lat, lon], 9, { animate: true }); }, [lat, lon, map]);
    return null;
}

export default function VesselDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthContext();
    const { addToast } = useToast();

    const [vessel, setVessel] = useState(null);
    const [events, setEvents] = useState([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subLoading, setSubLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isReplaying, setIsReplaying] = useState(false);
    const [replayData, setReplayData] = useState([]);
    const [replayStep, setReplayStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [v, evts] = await Promise.all([fetchVessel(id), fetchVesselEvents(id)]);
                setVessel(v);
                setEvents(evts);
                if (isAuthenticated) {
                    const subs = await fetchSubscriptions();
                    setIsSubscribed(subs.some(s => s.vessel.id === parseInt(id)));
                }
            } catch (err) {
                console.error("Vessel load failed:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isAuthenticated]);

    const handleSubscribe = async () => {
        if (!isAuthenticated) return;
        setSubLoading(true);
        try {
            if (isSubscribed) {
                await unsubscribeVessel(id);
                setIsSubscribed(false);
                addToast("Asset tracking deactivated.", "info");
            } else {
                await subscribeVessel(id);
                setIsSubscribed(true);
                addToast("Priority asset tracking engaged.", "success");
            }
        } catch (err) {
            console.error("Subscription toggle failed:", err);
            addToast("Data uplink failed.", "error");
        } finally {
            setSubLoading(false);
        }
    };

    const handleReplayToggle = async () => {
        if (!isReplaying) {
            try {
                const hist = await fetchVesselHistory(id);
                // filter positions only for Map coordinates tracking
                const positions = hist.filter(x => x.lat != null && x.lon != null);
                if (positions.length === 0) {
                    addToast("No historical coordinates found for replay.", "info");
                    return;
                }
                setReplayData(positions);
                setReplayStep(0);
                setIsReplaying(true);
            } catch (err) {
                console.error("Replay fetch error:", err);
                addToast("Data uplink failed.", "error");
            }
        } else {
            setIsReplaying(false);
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        if (!isReplaying || replayData.length === 0 || !isPlaying) return;
        if (replayStep >= replayData.length - 1) {
            setIsPlaying(false);
            return;
        }
        const t = setTimeout(() => setReplayStep(s => s + 1), 500);
        return () => clearTimeout(t);
    }, [isReplaying, replayData, replayStep, isPlaying]);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--brand-cyan)' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid rgba(34,211,238,0.2)', borderTopColor: 'var(--brand-cyan)', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }} />
                <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.1em' }}>ESTABLISHING TELEMETRY UPLINK...</div>
            </div>
        );
    }
    
    if (!vessel) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', marginTop: '2rem' }}>
                <AlertTriangle size={48} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <h2>Asset Not Found</h2>
                <p>The requested vessel signature could not be located in the database.</p>
                <button onClick={() => navigate(-1)} style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Return to Fleet Matrix</button>
            </div>
        );
    }

    const hasPosition = vessel.last_position_lat != null && vessel.last_position_lon != null;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="show" 
            variants={containerVariants}
            style={{ paddingBottom: '4rem' }}
        >
            {/* Header / Command Bar */}
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <button 
                        onClick={() => navigate(-1)} 
                        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-1)', width: '44px', height: '44px', borderRadius: '12px', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-1)' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1 }}>
                                {vessel.name}
                            </h1>
                            <span style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--brand-cyan)', border: '1px solid rgba(34,211,238,0.25)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                {vessel.vessel_type.toUpperCase()}
                            </span>
                        </div>
                        <p style={{ color: 'var(--text-1)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '1.5rem', fontFamily: 'monospace' }}>
                            <span>IMO: <span style={{ color: '#fff' }}>{vessel.imo_number}</span></span>
                            <span>FLAG: <span style={{ color: '#fff', fontSize: '1.1em' }}>{vessel.flag ? formatFlagCountry(vessel.flag) : '—'}</span></span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isSubscribed ? 'var(--brand-cyan)' : 'var(--text-2)' }}>
                                <ShieldCheck size={14} /> {isSubscribed ? 'SIGNAL SECURED' : 'UNSECURED SIGNAL'}
                            </span>
                        </p>
                    </div>
                </div>

                {isAuthenticated && (
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: isSubscribed ? '0 0 20px rgba(139,92,246,0.3)' : '0 0 20px rgba(34,211,238,0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubscribe}
                        disabled={subLoading}
                        style={{ 
                            background: isSubscribed ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))' : 'var(--brand-grad)', 
                            border: isSubscribed ? '1px solid rgba(139,92,246,0.5)' : 'none',
                            color: isSubscribed ? '#c4b5fd' : '#040914', 
                            padding: '0.85rem 1.75rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: subLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}
                    >
                        <Activity size={18} /> {subLoading ? 'PROCESSING...' : isSubscribed ? 'DISENGAGE TRACKING' : 'INITIALIZE TRACKING'}
                    </motion.button>
                )}
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 400px)', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left Column: Telemetry & Specs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Live Telemetry Matrix */}
                    <motion.div variants={itemVariants}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                            <Compass size={18} color="var(--brand-cyan)" /> Live Telemetry
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {[
                                { label: 'Speed Over Ground', value: vessel.speed != null ? `${vessel.speed.toFixed(1)} KTS` : 'OFFLINE', icon: <Activity size={16} /> },
                                { label: 'True Heading', value: vessel.heading != null ? `${vessel.heading}°` : 'OFFLINE', icon: <Navigation size={16} /> },
                                { label: 'Declared Destination', value: (vessel.destination && vessel.destination.toLowerCase() !== 'unknown') ? vessel.destination.toUpperCase() : 'NOT BROADCASTED', icon: <MapPin size={16} /> },
                                { label: 'Last Signal Update', value: vessel.last_update ? new Date(vessel.last_update).toLocaleTimeString() : 'UNKNOWN', icon: <Database size={16} /> },
                            ].map((stat) => (
                                <div key={stat.label} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', backdropFilter: 'blur(12px)' }}>
                                    <div style={{ color: 'var(--text-2)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        {React.cloneElement(stat.icon, { color: 'var(--brand-cyan)' })} {stat.label}
                                    </div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Ship Specifications */}
                    <motion.div variants={itemVariants}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                            <Box size={18} color="var(--brand-indigo)" /> Asset Specifications
                        </h2>
                        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '12px', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <tbody>
                                    {[
                                        ['Asset Class', vessel.vessel_type],
                                        ['Registry Flag', vessel.flag ? formatFlagCountry(vessel.flag) : '—'],
                                        ['Primary Cargo', vessel.cargo_type || 'Unknown'],
                                        ['Assigned Operator', vessel.operator || 'Unregistered'],
                                    ].map(([label, value]) => (
                                        <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem 1.25rem', color: 'var(--text-1)', width: '40%', fontSize: '0.85rem' }}>{label}</td>
                                            <td style={{ padding: '1rem 1.25rem', color: '#fff', fontWeight: 500, fontSize: '0.9rem' }}>{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Map & Events */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Tactical Map Preview — embedded Leaflet */}
                    <motion.div variants={itemVariants} style={{ border: '1px solid var(--border-hi)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,17,38,0.85)', backdropFilter: 'blur(12px)' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"Space Grotesk", sans-serif', margin: 0 }}>
                                <Map size={16} color="var(--brand-primary)" /> Tactical Position
                            </h2>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button 
                                    onClick={handleReplayToggle}
                                    style={{ background: isReplaying ? 'var(--brand-cyan)' : 'transparent', color: isReplaying ? '#000' : 'var(--brand-cyan)', border: '1px solid var(--brand-cyan)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    {isReplaying ? 'CLOSE REPLAY' : 'REPLAY VOYAGE'}
                                </button>
                                {hasPosition && !isReplaying && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }} />
                                        <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700, letterSpacing: '0.05em' }}>COORD LOCKED</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(hasPosition || isReplaying) ? (
                            <>
                                {isReplaying ? (
                                    <div style={{ padding: '0.8rem 1.25rem', background: 'rgba(4,9,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                            <button onClick={() => setReplayStep(Math.max(0, replayStep - 1))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff' }}><SkipBack size={18} /></button>
                                            <button onClick={() => { if(replayStep >= replayData.length - 1) setReplayStep(0); setIsPlaying(!isPlaying); }} style={{ background: 'var(--brand-cyan)', color: '#000', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                                                {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
                                            </button>
                                            <button onClick={() => setReplayStep(Math.min(replayData.length - 1, replayStep + 1))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff' }}><SkipForward size={18} /></button>
                                            
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max={Math.max(0, replayData.length - 1)} 
                                                    value={replayStep} 
                                                    onChange={(e) => setReplayStep(Number(e.target.value))}
                                                    style={{ width: '100%', accentColor: 'var(--brand-cyan)', cursor: 'pointer' }}
                                                />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--brand-cyan)', fontFamily: 'monospace' }}>
                                                {replayData[replayStep]?.time ? new Date(replayData[replayStep].time).toLocaleString() : ''}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '0.6rem 1.25rem', background: 'rgba(4,9,20,0.9)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--brand-cyan)', fontWeight: 600 }}>
                                            {Number(vessel.last_position_lat).toFixed(5)}° N &nbsp; {Number(vessel.last_position_lon).toFixed(5)}° E
                                        </span>
                                        <a
                                            href={`https://www.openstreetmap.org/?mlat=${vessel.last_position_lat}&mlon=${vessel.last_position_lon}&zoom=10`}
                                            target="_blank" rel="noreferrer"
                                            style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'color 0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.color = 'var(--brand-cyan)'}
                                            onMouseOut={e => e.currentTarget.style.color = 'var(--text-2)'}
                                        >
                                            Open OSM ↗
                                        </a>
                                    </div>
                                )}

                                {/* Map */}
                                <div style={{ height: '280px', width: '100%' }}>
                                    <MapContainer
                                        center={[vessel.last_position_lat, vessel.last_position_lon]}
                                        zoom={9}
                                        style={{ height: '100%', width: '100%' }}
                                        zoomControl={false}
                                        attributionControl={false}
                                        scrollWheelZoom={false}
                                    >
                                        <TileLayer
                                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        />
                                        <FlyTo lat={isReplaying && replayData[replayStep] ? replayData[replayStep].lat : vessel.last_position_lat} lon={isReplaying && replayData[replayStep] ? replayData[replayStep].lon : vessel.last_position_lon} />
                                        
                                        {isReplaying && Array.isArray(replayData) && replayData.length > 0 && (
                                            <Polyline 
                                                positions={replayData.slice(0, replayStep + 1).map(x => [x.lat, x.lon])} 
                                                pathOptions={{ color: '#22d3ee', weight: 3, opacity: 0.7, dashArray: '5, 5' }} 
                                            />
                                        )}

                                        {/* Watch-circle */}
                                        {!isReplaying && (
                                            <Circle
                                                center={[vessel.last_position_lat, vessel.last_position_lon]}
                                                radius={18000}
                                                pathOptions={{ color: '#22d3ee', weight: 1, opacity: 0.35, fillColor: '#22d3ee', fillOpacity: 0.04 }}
                                            />
                                        )}
                                        <Marker
                                            position={isReplaying && replayData[replayStep] ? [replayData[replayStep].lat, replayData[replayStep].lon] : [vessel.last_position_lat, vessel.last_position_lon]}
                                            icon={vesselDetailIcon}
                                        >
                                            <Popup>
                                                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#000' }}>
                                                    <strong>{vessel.name}</strong><br />
                                                    {vessel.vessel_type} · {vessel.flag ? vessel.flag.toUpperCase() : 'UNKNOWN'}<br />
                                                    {isReplaying && replayData[replayStep] ? 
                                                        new Date(replayData[replayStep].time).toLocaleString() : 
                                                        vessel.speed != null ? `${vessel.speed.toFixed(1)} kts` : 'Stationary'}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'rgba(4,9,20,0.8)', color: 'var(--text-2)' }}>
                                <MapPin size={36} opacity={0.25} style={{ margin: '0 auto 1rem', display: 'block' }} />
                                <div style={{ fontSize: '0.9rem' }}>No coordinate lock — vessel signal unavailable.</div>
                            </div>
                        )}
                    </motion.div>

                    {/* Operational Log */}
                    <motion.div variants={itemVariants}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontFamily: '"Space Grotesk", sans-serif' }}>
                            <Calendar size={18} color="var(--brand-cyan)" /> Operational Log
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {events.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface-1)', border: '1px dashed var(--border-hi)', borderRadius: '12px', color: 'var(--text-2)', fontSize: '0.85rem' }}>
                                    No recorded incidents or events in sector.
                                </div>
                            ) : (
                                events.map((ev, index) => (
                                    <motion.div 
                                        key={ev.id} 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        style={{ 
                                            background: ev.event_type.toLowerCase().includes('safety') ? 'linear-gradient(90deg, rgba(239,68,68,0.1), transparent)' : 'linear-gradient(90deg, rgba(255,255,255,0.03), transparent)', 
                                            borderLeft: ev.event_type.toLowerCase().includes('safety') ? '2px solid var(--danger)' : '2px solid var(--border-hi)', 
                                            borderRadius: '0 8px 8px 0', 
                                            padding: '1rem',
                                            display: 'flex', flexDirection: 'column', gap: '0.5rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: ev.event_type.toLowerCase().includes('safety') ? '#fca5a5' : 'var(--text-1)', textTransform: 'uppercase' }}>
                                                {ev.event_type}
                                            </span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-2)', fontFamily: 'monospace' }}>
                                                {new Date(ev.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                        {ev.details && <p style={{ margin: 0, color: '#fff', fontSize: '0.85rem', lineHeight: 1.4 }}>{ev.details}</p>}
                                        {ev.location && <div style={{ fontSize: '0.75rem', color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}><MapPin size={12} /> {ev.location}</div>}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

            </div>
        </motion.div>
    );
}
