import { useEffect, useState } from "react";

export default function RadarDisplay({
  scanSpeed = 4000,
  targetCount = 8,
  radarColor = "#10b981", // emerald
  alertColor = "#ef4444",
}) {
  const [angle, setAngle] = useState(0);
  const [time, setTime] = useState(0);

  /* ---------------- TARGET GENERATION ---------------- */
  const [targets, setTargets] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargets(Array.from({ length: targetCount }, (_, i) => ({
      id: i,
      angle: Math.random() * 360,
      distance: 25 + Math.random() * 45,
      speed: 0.05 + Math.random() * 0.2,
      alert: Math.random() > 0.7,
    })));
  }, [targetCount]);

  /* ---------------- ANIMATION LOOP ---------------- */
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

  /* ---------------- HELPERS ---------------- */
  const polarToXY = (a, d) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return {
      x: 50 + d * Math.cos(rad),
      y: 50 + d * Math.sin(rad),
    };
  };

  const diffAngle = (a) => {
    const diff = Math.abs(angle - a);
    return Math.min(diff, 360 - diff);
  };

  const DETECTION_WIDTH = 8;
  const beamBoost = targets.some((t) => {
    const movingAngle = t.angle + time * t.speed * 0.02;
    return diffAngle(movingAngle) < DETECTION_WIDTH;
  });

  return (
    <>
      {/* GLOBAL ANIMATIONS */}
      <style>{`
        @keyframes blink {
          0%,100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        @keyframes text-blink {
          0%,100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      <div
        className="relative w-full max-w-md mx-auto"
        style={{ aspectRatio: '1 / 1', minHeight: '320px' }}
      >
        {/* GLASS PANEL */}
        <div
          className="absolute inset-0 rounded-[50%]"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,.85), rgba(15,23,42,.95))",
            borderColor: "rgba(255,255,255,.1)",
            boxShadow: `0 0 60px ${radarColor}55`,
          }}
        />

        {/* RADAR CIRCLE */}
        <div className="absolute inset-2 rounded-full overflow-hidden">
          {/* BASE */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(0,30,50,.3), rgba(0,5,10,.95))",
              boxShadow: `inset 0 0 40px #000, 0 0 40px ${radarColor}55`,
            }}
          />

          {/* GRID CIRCLES */}
          {[20, 40, 60, 80].map((r) => (
            <div
              key={r}
              className="absolute rounded-full border"
              style={{
                inset: `${50 - r / 2}%`,
                borderColor: radarColor,
                opacity: 0.15,
              }}
            />
          ))}

          {/* GRID LINES */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 w-px h-1/2"
              style={{
                background: `linear-gradient(${radarColor}, transparent)`,
                opacity: 0.2,
                transformOrigin: "top",
                transform: `rotate(${i * 30}deg)`,
              }}
            />
          ))}

          {/* TARGETS */}
          {targets.map((t) => {
            const movingAngle = t.angle + time * t.speed * 0.02;
            const { x, y } = polarToXY(movingAngle, t.distance);
            const detected = diffAngle(movingAngle) < DETECTION_WIDTH;

            const size = detected ? 14 : 7;
            const color = t.alert ? alertColor : radarColor;

            return (
              <div
                key={t.id}
                className="absolute rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: size,
                  height: size,
                  transform: "translate(-50%,-50%)",
                  background: color,
                  boxShadow: detected
                    ? `0 0 25px ${color}, 0 0 40px ${color}`
                    : `0 0 10px ${color}`,
                  animation: detected ? "blink 0.4s ease-in-out" : "none",
                  transition: "all 0.2s ease",
                }}
              />
            );
          })}

          {/* SCAN LINE */}
          <div
            className="absolute inset-0"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: beamBoost ? "5px" : "2px",
                height: "50%",
                background: radarColor,
                transform: "translateX(-50%)",
                boxShadow: beamBoost
                  ? `0 0 40px ${radarColor}, 0 0 60px ${radarColor}`
                  : `0 0 20px ${radarColor}`,
                transition: "all 0.1s ease",
              }}
            />
          </div>

          {/* TEXT 16px BELOW CENTER */}
          <div
            className="absolute left-1/2 pointer-events-none"
            style={{
              top: "50%",
              transform: "translate(-50%, calc(-50% + 16px))",
              color: radarColor,
              fontFamily: "monospace",
              fontSize: "12px",
              letterSpacing: "0.35em",
              textShadow: `0 0 10px ${radarColor}`,
              animation: "text-blink 2s ease-in-out infinite",
            }}
          >
            MARITIME VISTA
          </div>

          {/* CENTER DOT */}
          <div
            className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full"
            style={{
              background: radarColor,
              transform: "translate(-50%,-50%)",
              boxShadow: `0 0 40px ${radarColor}`,
            }}
          />
        </div>
      </div>
    </>
  );
}
