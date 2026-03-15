import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Anchor, ShieldAlert, Navigation, ChevronRight, Zap } from 'lucide-react'
import RadarDisplay from '../components/common/RadarDisplay'

function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', background: 'radial-gradient(ellipse at 50% 15%, rgba(14, 30, 64, 0.45) 0%, rgba(4, 9, 20, 1) 65%)' }}>
      {/* ── Background Glow & Vignette ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80vh', background: 'radial-gradient(circle at 50% 25%, rgba(34,211,238,0.04) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />

      {/* ── Live Ticker ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(8,17,38,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.6rem 0', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', animation: 'marquee 32s linear infinite', minWidth: '100%' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-cyan)', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
            LIVE
          </span>
          <span style={{ color: '#fff', fontSize: '13px', opacity: 0.75 }}>Cargo Ship ZENITH entering Panama Canal zone</span>
          <span style={{ color: '#fff', fontSize: '13px', opacity: 0.75 }}>•</span>
          <span style={{ color: '#fff', fontSize: '13px', opacity: 0.75 }}>High congestion alert at Port of Singapore</span>
          <span style={{ color: '#fff', fontSize: '13px', opacity: 0.75 }}>•</span>
          <span style={{ color: '#fff', fontSize: '13px', opacity: 0.75 }}>Weather warning: Storm approaching North Sea transit lanes</span>
          <span style={{ color: '#fff', fontSize: '13px', opacity: 0.75 }}>•</span>
          <span style={{ color: '#fff', fontSize: '13px', opacity: 0.75 }}>Tanker OMEGA route recalibrated successfully</span>
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </motion.div>

      {/* ── Hero Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        alignItems: 'center',
        paddingTop: '32px',
        paddingBottom: '40px',
      }}>

        {/* ── Left: Text Content ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ maxWidth: '560px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--brand-cyan)', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '99px', padding: '0.35rem 1rem', fontWeight: 700 }}>
              Live Maritime Intelligence
            </span>
          </motion.div>

          <style>{`@keyframes shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }`}</style>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            style={{ fontSize: '56px', lineHeight: 1.3, margin: '1rem 0 1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: '"Space Grotesk", sans-serif', maxWidth: '14ch', position: 'relative', zIndex: 1 }}
          >
            Track every <span style={{ background: 'linear-gradient(90deg, #38bdf8, #60a5fa, #38bdf8)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent', display: 'inline-block', filter: 'drop-shadow(0 2px 8px rgba(56,189,248,0.3))', animation: 'shimmer 5s linear infinite', paddingBottom: '0.1em' }}>vessel</span>,<br />
            forecast <span style={{ background: 'linear-gradient(90deg, #60a5fa, #22d3ee, #60a5fa)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent', display: 'inline-block', filter: 'drop-shadow(0 2px 8px rgba(96,165,250,0.3))', animation: 'shimmer 5s linear infinite', paddingBottom: '0.1em' }}>congestion</span>,<br />
            surface <span style={{ background: 'linear-gradient(90deg, #fb923c, #f97316, #fb923c)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent', display: 'inline-block', filter: 'drop-shadow(0 2px 8px rgba(251,146,60,0.3))', animation: 'shimmer 5s linear infinite', paddingBottom: '0.1em' }}>safety risks</span>.
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            style={{ fontSize: '16px', color: '#f8fafc', opacity: 0.85, lineHeight: 1.65, margin: '18px 0 0 0', maxWidth: '520px', letterSpacing: '0.01em', position: 'relative', zIndex: 1 }}
          >
            Maritime Vista unifies live vessel tracking, port analytics, and safety
            overlays for operators, analysts, and fleet managers — all inside a powerful command view.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '28px', alignItems: 'center', position: 'relative', zIndex: 1 }}
          >
            <NavLink to="/register" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2, boxShadow: '0 8px 24px rgba(34,211,238,0.4)', background: 'linear-gradient(135deg,#2dd4bf,#3b82f6)' }}
                whileTap={{ scale: 0.98 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'linear-gradient(135deg,#22d3ee,#3b82f6)', color: '#040914', border: '1px solid rgba(255,255,255,0.1)', padding: '0.85rem 2rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: '"Inter", sans-serif', boxShadow: '0 4px 14px rgba(34,211,238,0.25), inset 0 1px 1px rgba(255,255,255,0.2)', transition: 'all 0.3s ease' }}
              >
                Get started free <ChevronRight size={18} strokeWidth={2.5} />
              </motion.button>
            </NavLink>
            <NavLink to="/map" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.98 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', padding: '0.85rem 2rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(12px)', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                View live map
              </motion.button>
            </NavLink>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={containerVariants}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '40px' }}
          >
            {[
              { icon: <Activity color="var(--brand-cyan)" size={18} />, value: '12,450', label: 'Active Vessels', accent: '#22d3ee' },
              { icon: <Anchor color="var(--brand-indigo)" size={18} />, value: '245', label: 'Ports Monitored', accent: '#6366f1' },
              { icon: <ShieldAlert color="#f59e0b" size={18} />, value: '18', label: 'Incidents Today', accent: '#f59e0b' },
              { icon: <Activity color="#f87171" size={18} />, value: '5', label: 'Congestion Alerts', accent: '#f87171' },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -3, borderColor: s.accent, boxShadow: `0 8px 24px ${s.accent}22` }}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', backdropFilter: 'blur(12px)', transition: 'all 0.25s ease' }}
              >
                {s.icon}
                <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: '"Space Grotesk", sans-serif', color: '#fff', lineHeight: 1, marginTop: '6px' }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right: Radar Visual ── */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1, marginTop: '-32px' }}
        >
          <motion.div
            whileHover={{ rotateX: 2, rotateY: -2, y: -4, boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            style={{ background: 'linear-gradient(135deg, rgba(16,24,39,0.5), rgba(4,9,20,0.85))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 24px 56px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.06)', backdropFilter: 'blur(32px)', width: '100%', maxWidth: '520px' }}
          >
            <RadarDisplay />
          </motion.div>

          <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(59,130,246,0.05))', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '14px', padding: '1.1rem 1.4rem', backdropFilter: 'blur(10px)', width: '100%', maxWidth: '520px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', fontFamily: '"Space Grotesk", sans-serif', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Navigation size={14} color="var(--brand-indigo)" /> Built for maritime professionals
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['Fleet Operator', 'Data Analyst', 'Safety Officer', 'Port Manager'].map(role => (
                <span key={role} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.28rem 0.75rem', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.72rem', color: 'var(--text-1)', fontWeight: 500 }}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default HomePage
