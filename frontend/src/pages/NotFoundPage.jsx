import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  // Animated radar sweep on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let angle = 0
    let raf

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const { width: W, height: H } = canvas
      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.42

      ctx.clearRect(0, 0, W, H)

      // Concentric rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (R / 4) * i, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(34,211,238,${0.06 + i * 0.025})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Cross-hairs
      ctx.strokeStyle = 'rgba(34,211,238,0.08)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke()

      // Sweep gradient
      const sweep = ctx.createConicalGradient
        ? ctx.createConicalGradient(angle, cx, cy)
        : null

      if (!sweep) {
        // fallback arc
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(angle)
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
        grad.addColorStop(0, 'rgba(34,211,238,0.5)')
        grad.addColorStop(1, 'rgba(34,211,238,0)')
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, R, -0.6, 0.6)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()
      }

      // Sweep line
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(R, 0)
      ctx.strokeStyle = 'rgba(34,211,238,0.9)'
      ctx.lineWidth = 2
      ctx.shadowColor = '#22d3ee'
      ctx.shadowBlur = 10
      ctx.stroke()
      ctx.restore()

      // Center dot
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#22d3ee'
      ctx.shadowColor = '#22d3ee'
      ctx.shadowBlur = 16
      ctx.fill()
      ctx.shadowBlur = 0

      angle += 0.025
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Radar canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          width: '220px', height: '220px',
          borderRadius: '50%',
          border: '1px solid rgba(34,211,238,0.2)',
          background: 'rgba(8,17,38,0.7)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 60px rgba(34,211,238,0.15), inset 0 0 40px rgba(34,211,238,0.04)',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          position: 'relative',
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        {/* NO SIGNAL badge */}
        <div style={{
          position: 'absolute', bottom: '22%', left: '50%', transform: 'translateX(-50%)',
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em',
          color: 'rgba(34,211,238,0.5)', fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}>NO SIGNAL</div>
      </motion.div>

      {/* 404 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div style={{
          fontSize: 'clamp(5rem, 14vw, 9rem)',
          fontWeight: 900,
          fontFamily: '"Space Grotesk", sans-serif',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, rgba(34,211,238,0.9) 0%, rgba(56,189,248,0.5) 50%, rgba(34,211,238,0.2) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem',
          textShadow: 'none',
          filter: 'drop-shadow(0 0 30px rgba(34,211,238,0.3))',
        }}>404</div>

        <h1 style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '0.75rem',
          letterSpacing: '0.02em',
        }}>
          Sector Not Found
        </h1>

        <p style={{
          color: 'var(--text-1)',
          fontSize: '0.95rem',
          maxWidth: '440px',
          lineHeight: 1.65,
          marginBottom: '2.5rem',
        }}>
          The requested coordinate is outside known maritime grid bounds.
          The vessel or page may have been relocated or decommissioned.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(34,211,238,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            style={{
              background: 'var(--brand-grad)',
              color: '#040914',
              border: 'none',
              padding: '0.9rem 2rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Return to HQ
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              color: 'var(--text-1)',
              border: '1px solid var(--border-hi)',
              padding: '0.9rem 2rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)'; e.currentTarget.style.color = '#fff' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.color = 'var(--text-1)' }}
          >
            ← Go Back
          </motion.button>
        </div>

        {/* Status bar */}
        <div style={{
          marginTop: '3rem',
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          color: 'var(--text-2)',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          letterSpacing: '0.08em',
        }}>
          {['ERR::ROUTE_UNRESOLVED', 'SIG::NULL', 'STATUS::404'].map((t) => (
            <span key={t} style={{ opacity: 0.5 }}>{t}</span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
