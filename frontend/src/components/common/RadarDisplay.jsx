import React, { useState, memo } from "react";

// RadarDisplay uses pure CSS animations for the sweep — zero JS animation overhead
const RadarDisplay = memo(function RadarDisplay({
  targetCount = 12,
  radarColor = "#22d3ee",
  alertColor = "#f87171",
}) {
  const [targets] = useState(() =>
    Array.from({ length: targetCount }, (_, i) => {
      const angle = Math.random() * 360;
      return {
        id: i,
        angle: angle,
        distance: 18 + Math.random() * 62,
        alert: Math.random() > 0.85,
        // The delay precisely matches when the scanner arm (5s total) crosses this angle.
        pingDelay: (angle / 360) * 5,
      };
    })
  );

  const polarToXY = (angleDeg, distance) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: 50 + distance * Math.cos(rad), y: 50 + distance * Math.sin(rad) };
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "420px", margin: "0 auto", aspectRatio: "1/1" }}>
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes target-ping {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0; box-shadow: 0 0 0px var(--ping-color); }
          2%   { transform: translate(-50%,-50%) scale(1.5); opacity: 1; box-shadow: 0 0 20px var(--ping-color); }
          10%  { transform: translate(-50%,-50%) scale(1); opacity: 0.8; box-shadow: 0 0 10px var(--ping-color); }
          50%  { opacity: 0.1; box-shadow: 0 0 2px var(--ping-color); }
          100% { opacity: 0; }
        }
        .radar-target {
          position: absolute;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: target-ping 5s infinite;
          /* ease-out helps the ping fade smoothly after the hit */
          animation-timing-function: ease-out;
        }
        .radar-sweep-arm {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          animation: radar-sweep 5s linear infinite;
          transform-origin: center;
          border-right: 2px solid rgba(34,211,238,0.9);
        }
      `}</style>

      {/* Outer Casing */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg,rgba(8,17,38,0.7),rgba(4,9,20,0.97))", boxShadow: "0 0 60px rgba(34,211,238,0.1),inset 0 0 40px rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.2)" }} />

      {/* Inner radar surface */}
      <div style={{ position: "absolute", inset: "12px", borderRadius: "50%", overflow: "hidden", background: "radial-gradient(circle at center,rgba(13,26,56,0.5),rgba(4,9,20,0.95))", boxShadow: "inset 0 0 80px rgba(0,0,0,0.9)", backgroundImage: `radial-gradient(rgba(34,211,238,0.05) 1px, transparent 1px)`, backgroundSize: "20px 20px", backgroundPosition: "center" }}>

        {/* Concentric rings */}
        {[20, 40, 60, 80].map(r => (
          <div key={r} style={{ position: "absolute", borderRadius: "50%", border: `1px solid ${radarColor}`, opacity: r === 80 ? 0.3 : 0.1, inset: `${50 - r / 2}%` }} />
        ))}

        {/* Cross-hair lines with degree ticks */}
        {[0, 30, 60, 90, 120, 150].map(deg => (
          <div key={deg} style={{ position: "absolute", left: "50%", top: "50%", width: "100%", height: deg % 90 === 0 ? "2px" : "1px", background: `linear-gradient(to right, ${radarColor}60 0%, transparent 10%, transparent 90%, ${radarColor}60 100%)`, transformOrigin: "left center", transform: `translate(-50%, -50%) rotate(${deg}deg)` }} />
        ))}

        {/* CSS-animated targets — no JS setState each frame */}
        {targets.map(t => {
          const { x, y } = polarToXY(t.angle, t.distance);
          const color = t.alert ? alertColor : radarColor;
          return (
            <div
              key={t.id}
              className="radar-target"
              style={{
                "--ping-color": color,
                left: `${x}%`,
                top: `${y}%`,
                width: t.alert ? 8 : 4,
                height: t.alert ? 8 : 4,
                background: color,
                animationDelay: `${t.pingDelay}s`,
              }}
            />
          );
        })}

        {/* CSS-driven sweep — single div, zero React state */}
        <div
          className="radar-sweep-arm"
          style={{
            background: `conic-gradient(from 0deg, transparent 330deg, rgba(34,211,238,0.06) 340deg, rgba(34,211,238,0.3) 355deg, rgba(34,211,238,0.75) 360deg)`,
            mixBlendMode: "screen",
          }}
        />

        {/* Center point */}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 8, height: 8, background: "#fff", borderRadius: "50%", transform: "translate(-50%,-50%)", boxShadow: `0 0 16px 4px ${radarColor}` }} />
      </div>

      {/* Range label */}
      <div style={{ position: "absolute", left: "50%", bottom: "14%", transform: "translateX(-50%)", color: radarColor, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", background: "rgba(4,9,20,0.65)", padding: "2px 8px", borderRadius: 4, border: `1px solid ${radarColor}40` }}>
        RANGE: 120 NM
      </div>
    </div>
  );
});

export default RadarDisplay;

