import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchVessel,
    fetchVesselEvents,
    subscribeVessel,
    unsubscribeVessel,
    fetchSubscriptions,
} from "../services/vesselService";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";
import { ArrowLeft, Ship, MapPin, Compass, Navigation, Activity, Box, Map, AlertTriangle, ShieldCheck, Database, Calendar, Anchor } from "lucide-react";

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
                            <span>FLAG: <span style={{ color: '#fff' }}>{vessel.flag.toUpperCase()}</span></span>
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
                                { label: 'Declared Destination', value: vessel.destination ? vessel.destination.toUpperCase() : 'CLASSIFIED', icon: <MapPin size={16} /> },
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
                                        ['Registry Flag', vessel.flag],
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
                    
                    {/* Tactical Map Preview */}
                    <motion.div variants={itemVariants} style={{ background: 'linear-gradient(135deg, rgba(8,17,38,0.8), rgba(4,9,20,0.9))', border: '1px solid var(--border-hi)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(12px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"Space Grotesk", sans-serif', m: 0 }}>
                                <Map size={16} color="var(--brand-primary)" /> Tactical Position
                            </h2>
                            {hasPosition && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)', animation: 'pulse 2s infinite' }} />}
                        </div>
                        
                        <div style={{ padding: '2rem 1.25rem', textAlign: 'center' }}>
                            {hasPosition ? (
                                <>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'monospace', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        {Number(vessel.last_position_lat).toFixed(4)}° N<br/>
                                        {Number(vessel.last_position_lon).toFixed(4)}° E
                                    </div>
                                    <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Coordinate lock confirmed.</p>
                                    <a
                                        href={`https://www.openstreetmap.org/?mlat=${vessel.last_position_lat}&mlon=${vessel.last_position_lon}&zoom=10`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', color: 'var(--brand-cyan)', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-cyan)'; e.currentTarget.style.color = '#000' }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(34,211,238,0.1)'; e.currentTarget.style.color = 'var(--brand-cyan)' }}
                                    >
                                        Access Global Grid ↗
                                    </a>
                                </>
                            ) : (
                                <div style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
                                    <MapPin size={32} opacity={0.3} style={{ margin: '0 auto 1rem', display: 'block' }} />
                                    No reliable coordinate lock achieved.
                                </div>
                            )}
                        </div>
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
