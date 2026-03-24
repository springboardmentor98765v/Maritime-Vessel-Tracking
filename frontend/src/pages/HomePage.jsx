import { NavLink } from 'react-router-dom'
import { Activity, Anchor, ShieldAlert, Navigation, ChevronRight, Zap, Target, Globe, User } from 'lucide-react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import RadarDisplay from '../components/common/RadarDisplay'

const AnimatedCounter = ({ value, delay = 0 }) => {
  const numericValue = parseInt(value.replace(/,/g, ''), 10);
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const display = useTransform(rounded, (latest) => latest.toLocaleString());
  
  useEffect(() => {
    const animation = animate(count, numericValue, { duration: 2.5, delay: delay, ease: "easeOut" });
    return animation.stop;
  }, [numericValue, delay, count]);

  return <motion.span>{display}</motion.span>;
};

function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 280, damping: 24 } }
  }

  return (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative', 
        minHeight: '100vh',
        background: '#020617', // Extremely dark slate for premium contrast
        overflow: 'hidden'
    }}>
      {/* ── Background Grid & Aurora Glow ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1000px', background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(34,211,238,0.06), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '800px', background: 'radial-gradient(circle at 80% 20%, rgba(99,102,241,0.04), transparent 40%)', pointerEvents: 'none' }} />
      <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)', 
          backgroundSize: '48px 48px', 
          pointerEvents: 'none', 
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 80%)', 
          WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 80%)' 
      }} />

      {/* ── Live Intelligence Ticker ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ 
            background: 'rgba(2, 6, 23, 0.6)', 
            borderBottom: '1px solid rgba(255,255,255,0.05)', 
            padding: '0.5rem 0', 
            overflow: 'hidden', 
            whiteSpace: 'nowrap', 
            display: 'flex', 
            alignItems: 'center',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', animation: 'marquee 40s linear infinite', minWidth: '100%' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#00E5FF', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, letterSpacing: '0.1em' }}>
            <div style={{ width: 6, height: 6, background: '#00E5FF', borderRadius: '50%', boxShadow: '0 0 8px #00E5FF', animation: 'pulse 2s infinite' }} /> LIVE INTEL
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500 }}><strong style={{ color: '#fff' }}>MSC ISABELLA</strong> departed Port of Rotterdam</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>•</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500 }}><strong style={{ color: '#f59e0b' }}>CONGESTION ALERT</strong>: Port of Singapore wait times exceeded 48h</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>•</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500 }}>Weather system detected near <strong style={{ color: '#fff' }}>Malacca Strait</strong> transit lanes</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>•</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500 }}><strong style={{ color: '#10b981' }}>SYSTEM UPDATE</strong>: Global AIS stream is fully operational</span>
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }`}</style>
      </motion.div>

      {/* ── Main Hero Section ── */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '4rem 2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2.5rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>

        {/* ── Left: Copy & CTAs ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          {/* Eyebrow badge */}
          <motion.div variants={itemVariants} style={{ marginBottom: '1.5rem' }}>
            <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.15em', 
                color: '#00E5FF', 
                background: 'rgba(0, 229, 255, 0.05)', 
                border: '1px solid rgba(0, 229, 255, 0.15)', 
                borderRadius: '100px', 
                padding: '0.4rem 1.25rem', 
                fontWeight: 700,
                boxShadow: '0 0 20px rgba(0,229,255,0.1)' 
            }}>
              <Zap size={14} color="#00E5FF" /> Next-Gen Maritime OS
            </span>
          </motion.div>

          <style>{`@keyframes shimmerText { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }`}</style>

          <motion.h1
            variants={itemVariants}
            style={{ 
                fontSize: 'clamp(36px, 4vw, 44px)', 
                lineHeight: 1.1, 
                margin: '0 0 1rem', 
                fontWeight: 700, 
                color: '#fff', 
                letterSpacing: '-0.02em', 
                fontFamily: '"Space Grotesk", sans-serif'
            }}
          >
            Track every vessel.<br />
            Monitor <span style={{ 
                background: 'linear-gradient(90deg, #00E5FF, #0055FF, #00E5FF)', 
                backgroundSize: '200% auto', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                color: 'transparent', 
                animation: 'shimmerText 6s linear infinite'
            }}>global ports</span>.<br />
            Surface risks.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            style={{ 
                fontSize: '15px', 
                color: 'rgba(255,255,255,0.65)', 
                lineHeight: 1.6, 
                margin: '0', 
                maxWidth: '520px', 
                letterSpacing: '0.01em',
                fontWeight: 400
            }}
          >
            Maritime Vista fundamentally changes how operators track fleets. Bring together live AIS data, predictive congestion, and real-time safety alerts into one shockingly powerful dashboard.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2.5rem', alignItems: 'center' }}
          >
            <NavLink to="/register" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.02, y: -1, boxShadow: '0 8px 24px rgba(0, 229, 255, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    background: 'linear-gradient(135deg, #00E5FF, #0055FF)', 
                    color: '#020617', 
                    border: 'none', 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '8px', 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    boxShadow: '0 4px 12px rgba(0,229,255,0.1), inset 0 1px 2px rgba(255,255,255,0.2)', 
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}
              >
                Start deploying <ChevronRight size={18} strokeWidth={2.5} />
              </motion.button>
            </NavLink>
            <NavLink to="/map" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.02, y: -1, background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    background: 'rgba(255,255,255,0.02)', 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '8px', 
                    fontSize: '0.9rem', 
                    fontWeight: 500, 
                    cursor: 'pointer', 
                    backdropFilter: 'blur(12px)', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}
              >
                Explore Live Map
              </motion.button>
            </NavLink>
          </motion.div>

          {/* Social Proof / Tiny trust bar */}
          <motion.div variants={itemVariants} style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.8 }}>
              <div style={{ display: 'flex', marginLeft: '10px' }}>
                  {[1,2,3,4].map(i => (
                      <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, #00E5FF ${i*10}%, #0055FF)`, border: '2px solid #020617', marginLeft: -10, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '10px' }}>
                          <User size={14} />
                      </div>
                  ))}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                  Trusted by <span style={{ color: '#fff', fontWeight: 600 }}>10,000+</span> global fleet operators.
              </div>
          </motion.div>
        </motion.div>

        {/* ── Right: Tech Visual Showcase ── */}
        <motion.div
          initial={{ opacity: 0, x: 40, filter: 'blur(20px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
          style={{ position: 'relative' }}
        >
          {/* Main Glow behind the radar */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 60%)', filter: 'blur(60px)', zIndex: -1 }} />
          
          <motion.div
            whileHover={{ rotateY: -2, rotateX: 2, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            style={{ 
                background: 'rgba(4, 10, 24, 0.4)', 
                border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '32px', 
                padding: '3rem 2rem', 
                boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(40px)',
                position: 'relative',
                transformStyle: 'preserve-3d'
            }}
          >
            <RadarDisplay radarColor="#00E5FF" alertColor="#ef4444" targetCount={8} />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Stats Strip Divider ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(2, 6, 23, 0.4)', backdropFilter: 'blur(24px)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
              {[
                  { icon: <Target size={24} color="#00E5FF" />, value: '12,450+', label: 'Vessels Tracked Live' },
                  { icon: <Globe size={24} color="#6366f1" />, value: '3,800+', label: 'Ports Monitored' },
                  { icon: <ShieldAlert size={24} color="#ef4444" />, value: '99.9%', label: 'Safety Alert Accuracy' },
                  { icon: <Activity size={24} color="#10b981" />, value: '< 200ms', label: 'Telemetry Latency' },
              ].map((stat, i) => (
                  <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      viewport={{ once: true }} 
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                  >
                      <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                          {stat.icon}
                      </div>
                      <div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}>
                              <AnimatedCounter value={stat.value} delay={0.2} />
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{stat.label}</div>
                      </div>
                  </motion.div>
              ))}
          </div>
      </div>
    </div>
  )
}

export default HomePage
