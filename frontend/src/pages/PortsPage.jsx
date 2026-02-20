import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPortCongestion } from '../services/portService';

const LEVEL_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    moderate: '#eab308',
    low: '#22c55e',
};

const LEVEL_EMOJI = {
    critical: '🔴',
    high: '🟠',
    moderate: '🟡',
    low: '🟢',
};

export default function PortsPage() {
    const [ports, setPorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastRefresh, setLastRefresh] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchPortCongestion();
            setPorts(data);
            setLastRefresh(new Date().toLocaleTimeString());
        } catch {
            setError('Failed to load port congestion data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const timer = setInterval(loadData, 120_000);
        return () => clearInterval(timer);
    }, []);

    const criticalCount = ports.filter(p => p.congestion_level === 'critical').length;

    if (loading) return <div className="ports-loading">⏳ Loading port congestion data…</div>;
    if (error) return <div className="ports-error">{error}</div>;

    return (
        <div className="ports-page">
            <div className="ports-header">
                <div>
                    <h1>⚓ Port Congestion Dashboard</h1>
                    <p className="ports-subtitle">
                        {ports.length} ports monitored · {criticalCount} critical alert{criticalCount !== 1 && 's'}
                        {lastRefresh && <span className="ports-refresh"> · Updated {lastRefresh}</span>}
                    </p>
                </div>
                <button className="button button--ghost button--sm" onClick={loadData}>🔄 Refresh</button>
            </div>

            {/* Summary bar */}
            <div className="congestion-summary">
                {['critical', 'high', 'moderate', 'low'].map(level => {
                    const count = ports.filter(p => p.congestion_level === level).length;
                    return (
                        <div key={level} className={`congestion-summary-card congestion-summary-card--${level}`}>
                            <span className="cs-emoji">{LEVEL_EMOJI[level]}</span>
                            <span className="cs-count">{count}</span>
                            <span className="cs-label">{level}</span>
                        </div>
                    );
                })}
            </div>

            <div className="ports-table-wrap">
                <table className="ports-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Port</th>
                            <th>Country</th>
                            <th>Status</th>
                            <th>Score</th>
                            <th>Avg Wait (h)</th>
                            <th>Arrivals</th>
                            <th>Departures</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ports.map((port, idx) => (
                            <tr key={port.id} className={port.alert ? 'port-row--alert' : ''}>
                                <td className="text-muted">{idx + 1}</td>
                                <td>
                                    <Link to={`/ports/${port.id}`} className="port-name-link">
                                        {port.name}
                                    </Link>
                                    <div className="port-location-label">{port.location}</div>
                                </td>
                                <td>{port.country}</td>
                                <td>
                                    <span className="congestion-badge" style={{ background: LEVEL_COLORS[port.congestion_level] + '22', color: LEVEL_COLORS[port.congestion_level] }}>
                                        {LEVEL_EMOJI[port.congestion_level]} {port.congestion_level}
                                    </span>
                                </td>
                                <td>
                                    <div className="score-bar-wrap">
                                        <div className="score-bar" style={{ width: `${port.congestion_score}%`, background: LEVEL_COLORS[port.congestion_level] }} />
                                        <span className="score-val">{port.congestion_score ?? '—'}</span>
                                    </div>
                                </td>
                                <td>{port.avg_wait_time ?? '—'}</td>
                                <td>{port.arrivals ?? '—'}</td>
                                <td>{port.departures ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
