import React, { useEffect, useState } from "react";

export default function RadarDisplay({
  scanSpeed = 4000,
  targetCount = 8,
  radarColor = "#22d3ee",
  alertColor = "#ef4444",
}) {
  const [angle, setAngle] = useState(0);
  const [time, setTime] = useState(0);

  const targets = React.useMemo(() => {
    return Array.from({ length: targetCount }, (_, i) => ({
      id: i,
      angle: Math.random() * 360,
      distance: 22 + Math.random() * 42,
      speed: 0.04 + Math.random() * 0.18,
      alert: Math.random() > 0.72,
    }));
  }, [targetCount]);

  useEffect(() => {
    let raf;
    let last = performance.now();
    const animate = (now) => {
      const delta = now - last;
      last = now;
      setAngle((a) => (a + (360 * delta) / scanSpeed) % 360);
      setTime((t) => t + delta);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [scanSpeed]);

  const polarToXY = (a, d) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return { x: 50 + d * Math.cos(rad), y: 50 + d * Math.sin(rad) };
  };

  const diffAngle = (a) => {
    const diff = Math.abs(angle - a);
    return Math.min(diff, 360 - diff);
  };

  const DETECTION_WIDTH = 8;

  return (
    <>
      <style>{`
        @keyframes radarBlink {
          0%,100% { opacity:1; }
          50% { opacity:0.15; }
        }
        @keyframes radarTextBlink {
          0%,100% { opacity:0.45; }
          50% { opacity:1; }
        }
        @keyframes radarPulse {
          0% { transform:translate(-50%,-50%) scale(1); opacity:0.9; }
          100% { transform:translate(-50%,-50%) scale(2.5); opacity:0; }
        }
      `}</style>

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
        aspectRatio: '1/1',
      }}>
        {/* Outer glow ring */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,rgba(15,23,42,.9),rgba(4,12,24,.98))',
          boxShadow: `0 0 70px ${radarColor}44, 0 0 120px ${radarColor}22`,
          border: '1px solid rgba(34,211,238,0.15)',
        }} />

        {/* Inner radar circle */}
        <div style={{
          position: 'absolute', inset: '8px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'radial-gradient(circle at center,rgba(0,35,60,.35),rgba(2,8,20,.98))',
          boxShadow: `inset 0 0 50px rgba(0,0,0,.8)`,
        }}>
          {/* Sweep gradient behind scan line */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: `conic-gradient(from ${angle}deg, ${radarColor}20 0deg, transparent 60deg, transparent 360deg)`,
          }} />

          {/* Concentric range rings */}
          {[20, 40, 60, 80].map((r) => (
            <div key={r} style={{
              position: 'absolute',
              borderRadius: '50%',
              border: `1px solid ${radarColor}`,
              opacity: 0.12,
              inset: `${50 - r / 2}%`,
            }} />
          ))}

          {/* Cross-hair lines */}
          {[0, 45, 90, 135].map((deg) => (
            <div key={deg} style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: '100%', height: '1px',
              background: `linear-gradient(to right,transparent,${radarColor}30,transparent)`,
              transformOrigin: 'left center',
              transform: `rotate(${deg}deg)`,
            }} />
          ))}

          {/* Targets */}
          {targets.map((t) => {
            const movingAngle = t.angle + time * t.speed * 0.02;
            const { x, y } = polarToXY(movingAngle, t.distance);
            const detected = diffAngle(movingAngle) < DETECTION_WIDTH;
            const size = detected ? 12 : 6;
            const color = t.alert ? alertColor : radarColor;
            return (
              <div key={t.id}>
                <div
                  style={{
                    position: "absolute",
                    left: `${x}%`,
                    top: `${y}%`,
                    width: size,
                    height: size,
                    transform: "translate(-50%,-50%)",
                    borderRadius: "50%",
                    background: color,
                    boxShadow: detected
                      ? `0 0 20px ${color}, 0 0 35px ${color}`
                      : `0 0 8px ${color}`,
                    animation: detected ? "radarBlink 0.5s ease-in-out" : "none",
                  }}
                />
                {detected && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${x}%`,
                      top: `${y}%`,
                      width: size * 3,
                      height: size * 3,
                      transform: "translate(-50%,-50%)",
                      borderRadius: "50%",
                      border: `2px solid ${color}`,
                      animation: "radarPulse 1s ease-out infinite",
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Scan line */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: `conic-gradient(from ${angle}deg, ${radarColor}40 0deg, ${radarColor}10 8deg, transparent 25deg, transparent 360deg)`,
            opacity: 0.6,
          }} />

          {/* Center point */}
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            width: '6px', height: '6px',
            background: radarColor,
            borderRadius: '50%',
            transform: 'translate(-50%,-50%)',
            boxShadow: `0 0 15px ${radarColor}`,
          }} />
        </div>

        {/* Radar Labels */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '8%',
          transform: 'translateX(-50%)',
          color: radarColor,
          fontSize: '11px',
          opacity: 0.45,
          fontWeight: 600,
          letterSpacing: '1px',
          animation: 'radarTextBlink 2s ease-in-out infinite',
        }}>
          RANGE: 64nm
        </div>
      </div>
    </>
  );
}
