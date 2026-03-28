import { NavLink } from 'react-router-dom'
import { Activity, Anchor, ShieldAlert, Navigation, ChevronRight, Zap, Target, Globe, User, Shield, Map, Ship, PlayCircle, BarChart3, ArrowUpRight, Lock } from 'lucide-react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import RadarDisplay from '../components/common/RadarDisplay'

const AnimatedCounter = ({ value, delay = 0 }) => {
  const raw = value.replace(/[^0-9.]/g, '')
  const numericValue = parseFloat(raw) || 0
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => {
    const suffix = value.replace(/^[^0-9]*/, '').replace(/[0-9,.]+/, '')
    return numericValue < 1 ? value : `${Math.round(v).toLocaleString()}${suffix.trim()}`
  })

  useEffect(() => {
    const animation = animate(count, numericValue, { duration: 2.5, delay, ease: 'easeOut' })
    return animation.stop
  }, [numericValue, delay, count])

  return <motion.span>{rounded}</motion.span>
}

const FEATURES_GRID = [
  { to: '/map',       icon: Map,         color: '#22d3ee', title: 'Live Global Map',      desc: 'Real-time AIS vessel positions across all ocean sectors, updated every 30 seconds.' },
  { to: '/vessels',  icon: Ship,        color: '#818cf8', title: 'Fleet Intelligence',   desc: 'Search 12,000+ vessels by type, flag, cargo, and destination with intelligent filters.' },
  { to: '/ports',    icon: Anchor,      color: '#34d399', title: 'Port Analytics',        desc: 'Live terminal congestion scores, arrival/departure matrices, and wait-time forecasts.' },
  { to: '/voyages',  icon: PlayCircle,  color: '#f87171', title: 'Voyage Replay',         desc: 'Cinematic playback of historical routes with timestamped waypoints and speed data.' },
  { to: '/analytics',icon: BarChart3,   color: '#fbbf24', title: 'Strategic Analytics',  desc: 'Executive KPIs, fleet composition breakdowns, and voyage status in one unified view.' },
  { to: '/dashboard',icon: Shield,      color: '#a78bfa', title: 'Command Center',       desc: 'Your personalized hub — notifications, tracked vessels, and system health at a glance.' },
]

const TRUST_BADGES = ['End-to-end encrypted', 'JWT authenticated', 'GDPR compliant', '99.9% uptime']

function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 28, filter: 'blur(12px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 22 } }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', minHeight: '100vh', background: '#020617', overflow: 'hidden' }}>

      {/* ── Ambient Background Layers ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '900px', background: 'radial-gradient(ellipse 90% 70% at 50% -15%, rgba(34,211,238,0.14), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(34,211,238,0.06), transparent 65%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none', maskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)' }} />

      {/* ── Live Ticker ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: 'rgba(2,6,23,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.45rem 0', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 10 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', animation: 'marquee 45s linear infinite', minWidth: '200%' }}>
          {[1, 2].map(repeat => (
            <span key={repeat} style={{ display: 'inline-flex', alignItems: 'center', gap: '3rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00E5FF', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, background: '#00E5FF', borderRadius: '50%', boxShadow: '0 0 8px #00E5FF' }} /> LIVE INTEL
              </span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}><strong style={{ color: '#fff' }}>MSC ISABELLA</strong> departed Port of Rotterdam · ETA Hamburg 06:00Z</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}><strong style={{ color: '#f59e0b' }}>CONGESTION ALERT:</strong> Singapore wait times exceeded 48h</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>Weather system detected near <strong style={{ color: '#fff' }}>Malacca Strait</strong> transit lanes</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}><strong style={{ color: '#10b981' }}>SYSTEM:</strong> Global AIS stream operational — 12,450 vessels tracked</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } @keyframes shimmerText { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; }}`}</style>
      </motion.div>

      {/* ── HERO SECTION ── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: 'clamp(4rem,10vh,8rem) 2rem clamp(3rem,6vh,6rem)', display: 'grid', gridTemplateColumns: 'minmax(380px, 1.15fr) 0.85fr', gap: '5rem', alignItems: 'center', position: 'relative', zIndex: 10 }}>

        {/* Left: Copy */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Eyebrow badge */}
          <motion.div variants={itemVariants} style={{ marginBottom: '1.75rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#00E5FF', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '100px', padding: '0.45rem 1.25rem', fontWeight: 700, boxShadow: '0 0 24px rgba(0,229,255,0.1)' }}>
              <Zap size={13} color="#00E5FF" /> Next-Gen Maritime Intelligence OS
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="text-display-1" style={{ margin: '0 0 1.75rem', color: '#fff' }}>
            Track every vessel.<br />
            Monitor{' '}
            <span style={{ background: 'linear-gradient(90deg, #00E5FF, #3b82f6, #00E5FF)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', animation: 'shimmerText 6s linear infinite' }}>global ports</span>.<br />
            Surface risks.
          </motion.h1>

          {/* Description */}
          <motion.p variants={itemVariants} style={{ fontSize: 'clamp(1rem, 1.4vw, 1.2rem)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0, maxWidth: '540px', fontWeight: 400 }}>
            Maritime Vista unifies live AIS feeds, predictive port congestion analysis, and real-time safety alert broadcasting into a single enterprise-grade intelligence platform trusted by global fleet operators.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2.75rem', alignItems: 'center' }}>
            <NavLink to="/register" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.03, y: -3, boxShadow: '0 16px 40px rgba(0,229,255,0.4)' }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'linear-gradient(135deg, #00E5FF 0%, #0055FF 100%)', color: '#020617', border: 'none', padding: '1.05rem 2.4rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,229,255,0.25), inset 0 2px 4px rgba(255,255,255,0.35)', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)', letterSpacing: '-0.01em' }}
              >
                Start deploying <ChevronRight size={18} strokeWidth={2.5} />
              </motion.button>
            </NavLink>
            <NavLink to="/map" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.03, y: -3, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)' }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', padding: '1.05rem 2.25rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(24px)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)' }}
              >
                <Map size={18} /> Explore Live Map
              </motion.button>
            </NavLink>
          </motion.div>

          {/* Trust bar */}
          <motion.div variants={itemVariants} style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, hsl(${190 + i * 30},80%,55%) 0%, hsl(${220 + i * 20},70%,45%) 100%)`, border: '2px solid #020617', marginLeft: i > 0 ? -10 : 0, display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                  <User size={13} color="#fff" />
                </div>
              ))}
            </div>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
              Trusted by <strong style={{ color: '#fff' }}>10,000+</strong> global fleet operators
            </span>
            <div style={{ height: 16, width: 1, background: 'rgba(255,255,255,0.12)' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              {TRUST_BADGES.slice(0,2).map(b => (
                <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  <Lock size={10} color="rgba(34,211,238,0.5)" /> {b}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Radar visual */}
        <motion.div
          initial={{ opacity: 0, x: 50, filter: 'blur(20px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.35, type: 'spring', stiffness: 90, damping: 20 }}
          style={{ position: 'relative' }}
        >
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '120%', height: '120%', background: 'radial-gradient(circle, rgba(0,229,255,0.18) 0%, transparent 55%)', filter: 'blur(40px)', zIndex: -1, pointerEvents: 'none' }} />

          {/* Floating stat pills */}
          {[
            { label: 'Vessels online', value: '12,450', color: '#22d3ee', top: '0', left: '0' },
            { label: 'Critical alerts', value: '14', color: '#ef4444', top: '40%', right: '-5%' },
            { label: 'Uptime', value: '99.9%', color: '#10b981', bottom: '0', left: '10%' },
          ].map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15, type: 'spring', stiffness: 280, damping: 24 }}
              style={{ position: 'absolute', ...b, background: 'rgba(4,10,24,0.85)', backdropFilter: 'blur(24px)', border: `1px solid ${b.color}30`, borderRadius: '12px', padding: '0.55rem 0.9rem', zIndex: 20, pointerEvents: 'none' }}
            >
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{b.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: b.color, fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}>{b.value}</div>
            </motion.div>
          ))}

          <motion.div
            whileHover={{ rotateY: -3, rotateX: 2, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ background: 'rgba(4,10,24,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '32px', padding: 'clamp(2rem,4vw,3.5rem) clamp(1.5rem,3vw,2.5rem)', boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.08)', backdropFilter: 'blur(48px)', position: 'relative', transformStyle: 'preserve-3d' }}
          >
            <RadarDisplay radarColor="#00E5FF" alertColor="#ef4444" targetCount={14} />
          </motion.div>
        </motion.div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(2,6,23,0.5)', backdropFilter: 'blur(24px)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12.5rem, 1fr))', gap: '2rem' }}>
          {[
            { icon: <Target size={22} color="#22d3ee" />, value: '12,450+', label: 'Vessels Tracked Live', color: '#22d3ee' },
            { icon: <Globe size={22} color="#6366f1" />, value: '3,800+', label: 'Ports Monitored', color: '#6366f1' },
            { icon: <ShieldAlert size={22} color="#ef4444" />, value: '99.9%', label: 'Safety Alert Accuracy', color: '#ef4444' },
            { icon: <Activity size={22} color="#10b981" />, value: '<200ms', label: 'Telemetry Latency', color: '#10b981' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16,1,0.3,1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', padding: '0.5rem' }}
            >
              <div style={{ width: 46, height: 46, borderRadius: '13px', background: `${stat.color}12`, border: `1px solid ${stat.color}25`, display: 'grid', placeItems: 'center', boxShadow: `0 4px 12px ${stat.color}15` }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', fontWeight: 900, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {stat.value.includes('<') ? stat.value : <AnimatedCounter value={stat.value} delay={0.3 + i * 0.1} />}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginTop: '0.35rem' }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FEATURES GRID SECTION ── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: 'clamp(5rem,10vh,8rem) 2rem', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#6366f1', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '100px', padding: '0.4rem 1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            <BarChart3 size={12} /> Intelligence Platform
          </div>
          <h2 className="text-display-2" style={{ color: '#fff', marginBottom: '1rem' }}>
            Every module. Every insight.<br />
            <span style={{ background: 'linear-gradient(90deg, #22d3ee, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>One unified command center.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.65 }}>
            Six purpose-built intelligence modules, designed to give global maritime operators a decisive operational edge.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))', gap: '1.25rem' }}>
          {FEATURES_GRID.map((f, i) => (
            <NavLink key={f.to} to={f.to} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.06, duration: 0.55, ease: [0.16,1,0.3,1] }}
                whileHover={{ y: -8, borderColor: `${f.color}50` }}
                style={{ background: 'rgba(8,16,38,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', height: '100%', backdropFilter: 'blur(24px)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s, transform 0.3s', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                {/* Corner glow */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: 180, height: 180, background: `radial-gradient(circle at top right, ${f.color}14, transparent 60%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${f.color}40, transparent)` }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '14px', background: `${f.color}12`, border: `1px solid ${f.color}30`, display: 'grid', placeItems: 'center', boxShadow: `0 4px 16px ${f.color}20` }}>
                    <f.icon size={22} color={f.color} />
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'grid', placeItems: 'center' }}>
                    <ArrowUpRight size={15} color="rgba(255,255,255,0.3)" />
                  </div>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{f.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{f.desc}</div>
                </div>

                <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', paddingTop: '1rem', borderTop: `1px solid ${f.color}15` }}>
                  <span style={{ fontSize: '0.7rem', color: f.color, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    Open module <ChevronRight size={12} />
                  </span>
                </div>
              </motion.div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA BAND ── */}
      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(2,6,23,0.6)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(4rem,8vh,6rem) 2rem', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          >
            <h2 className="text-display-2" style={{ color: '#fff', marginBottom: '1.25rem' }}>
              Ready to take command of your fleet?
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
              Join thousands of maritime operators who have moved from spreadsheets to real-time intelligence.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <NavLink to="/register" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.04, y: -3, boxShadow: '0 16px 40px rgba(0,229,255,0.4)' }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'linear-gradient(135deg, #00E5FF 0%, #0055FF 100%)', color: '#020617', border: 'none', padding: '1.05rem 2.4rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,229,255,0.25)', transition: 'all 0.25s' }}>
                  Get started free <ChevronRight size={18} strokeWidth={2.5} />
                </motion.button>
              </NavLink>
              <NavLink to="/login" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', padding: '1.05rem 2.25rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(24px)', transition: 'all 0.25s' }}>
                  Sign in to dashboard
                </motion.button>
              </NavLink>
            </div>

            {/* Trust badges row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.75rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              {TRUST_BADGES.map(b => (
                <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                  <Lock size={10} color="rgba(34,211,238,0.4)" /> {b}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  )
}

export default HomePage
