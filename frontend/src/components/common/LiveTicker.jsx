import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MOCK_EVENTS = [
  { id: 1, type: 'movement', text: 'Vessel ALPHA departed Shanghai Port', time: 'Just now' },
  { id: 2, type: 'safety', text: 'New high-risk weather front detected in the North Sea', time: '2m ago' },
  { id: 3, type: 'analytics', text: 'Rotterdam Port congestion dropped by 12%', time: '5m ago' },
  { id: 4, type: 'movement', text: 'Cargo Ship ZENITH entering Panama Canal', time: '11m ago' },
  { id: 5, type: 'safety', text: 'Piracy alert downgraded off the coast of Somalia', time: '18m ago' },
];

export default function LiveTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOCK_EVENTS.length);
    }, 4500); // Rotate every 4.5 seconds

    return () => clearInterval(timer);
  }, []);

  // Only show on Dashboard and Home
  if (location.pathname !== '/' && location.pathname !== '/dashboard') {
    return null;
  }

  const currentEvent = MOCK_EVENTS[currentIndex];

  const getIconColor = (type) => {
    switch (type) {
      case 'safety': return '#f59e0b';
      case 'analytics': return '#8b5cf6';
      default: return '#22d3ee';
    }
  };

  return (
    <div className="live-ticker-container">
      <div className="live-ticker-inner">
        <div className="ticker-badge">⚡ LIVE</div>
        <div className="ticker-content" key={currentEvent.id}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor(currentEvent.type)} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {currentEvent.type === 'safety' ? (
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
            ) : currentEvent.type === 'analytics' ? (
              <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />
            ) : (
              <path d="M5 12h14M12 5l7 7-7 7" />
            )}
          </svg>
          <span className="ticker-text">{currentEvent.text}</span>
          <span className="ticker-time">{currentEvent.time}</span>
        </div>
      </div>
    </div>
  );
}
