import React from 'react'

export default function SkeletonLoader({ type = 'row', count = 1, style = {} }) {
    const skeletons = Array.from({ length: count })

    if (type === 'card') {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', ...style }}>
                {skeletons.map((_, i) => (
                    <div key={i} style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px', padding: '1.5rem', height: '140px',
                        display: 'flex', flexDirection: 'column', gap: '1rem',
                        animation: 'pulseOpacity 1.5s infinite ease-in-out'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ height: '14px', width: '60%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
                                <div style={{ height: '10px', width: '40%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
                            </div>
                        </div>
                        <div style={{ height: '24px', width: '30%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginTop: 'auto' }} />
                    </div>
                ))}
                <style>{`
                    @keyframes pulseOpacity {
                        0%, 100% { opacity: 0.5; }
                        50% { opacity: 1; }
                    }
                `}</style>
            </div>
        )
    }

    // Default 'row'
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', ...style }}>
            {skeletons.map((_, i) => (
                <div key={i} style={{
                    height: '56px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)', animation: 'pulseOpacity 1.5s infinite ease-in-out',
                    animationDelay: `${i * 0.1}s`
                }} />
            ))}
            <style>{`
                @keyframes pulseOpacity {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    )
}
