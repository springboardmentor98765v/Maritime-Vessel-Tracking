/*import React, { useEffect, useState } from 'react';
import MapComponent from '../components/Map';
import { getVessels } from '../services/api';
import '../App.css'; // Reusing existing styles for now or create generic structure

import { useNavigate } from "react-router-dom";




const Dashboard = () => {
    const [vessels, setVessels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVessels = async () => {
            try {
                const response = await getVessels();
                setVessels(response.data);
            } catch (err) {
                setError('Failed to load vessel data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVessels();
        useEffect(() => {
    fetchVessels();

    const interval = setInterval(fetchVessels, 30000);

    return () => clearInterval(interval);
}, []);
    }, []);

    if (loading) return <div className="container">Loading vessels...</div>;
    if (error) return <div className="container" style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Maritime Vessel Tracking Dashboard</h2>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: '300px' }}>
                    <MapComponent vessels={vessels} />
                </div>
                <div style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.9)', padding: '20px', borderRadius: '12px' }}>
                    <h3>Vessel List</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {vessels.map(v => (
                            <li key={v.id} style={{ marginBottom: '10px', padding: '10px', borderBottom: '1px solid #ccc' }}>
                                <strong>{v.name}</strong> <br />
                                <small>Type: {v.type} | Status: {v.status}</small>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
*/