import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Ship, Anchor, LayoutDashboard, Map, Settings, PlayCircle, BarChart3, Database } from 'lucide-react'
import api from '../../services/api'
import { useAuthContext } from '../../context/AuthContext'

const baseLinks = [
    { id: 'l1', type: 'link', title: 'System Overview', icon: <Database size={16} />, to: '/' },
    { id: 'l2', type: 'link', title: 'Dashboard', icon: <LayoutDashboard size={16} />, to: '/dashboard' },
    { id: 'l3', type: 'link', title: 'Live Map', icon: <Map size={16} />, to: '/map' },
    { id: 'l4', type: 'link', title: 'Live Vessel Tracking', icon: <Ship size={16} />, to: '/vessels' },
    { id: 'l5', type: 'link', title: 'Port Analytics', icon: <Anchor size={16} />, to: '/ports' },
    { id: 'l6', type: 'link', title: 'Voyage Replay', icon: <PlayCircle size={16} />, to: '/voyages' },
    { id: 'l7', type: 'link', title: 'Analytics Dashboard', icon: <BarChart3 size={16} />, to: '/analytics' },
    { id: 'l8', type: 'link', title: 'Admin Panel', icon: <Settings size={16} />, to: '/admin' },
]

export default function CommandPalette({ isOpen, onClose }) {
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const { isAuthenticated } = useAuthContext()
    const navigate = useNavigate()
    const inputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setSearch('')
            setSelectedIndex(0)
            setResults(baseLinks)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const timer = setTimeout(async () => {
            const q = search.trim().toLowerCase()
            if (!q) {
                setResults(baseLinks)
                return
            }

            setLoading(true)
            let filteredLinks = baseLinks.filter(l => l.title.toLowerCase().includes(q))
            let vesselResults = []
            
            try {
                if (isAuthenticated && q.length > 2) {
                    const res = await api.get(`/vessels/?search=${q}`)
                    vesselResults = (res.data || []).slice(0, 5).map(v => ({
                        id: `v_${v.id}`,
                        type: 'vessel',
                        title: `Track Vessel: ${v.name}`,
                        subtitle: `IMO: ${v.imo_number} - ${v.vessel_type}`,
                        icon: <Ship size={16} />,
                        to: `/vessels/${v.id}`
                    }))
                }
            } catch (err) {
                console.error('Command search failed', err)
            }

            setResults([...filteredLinks, ...vesselResults])
            setSelectedIndex(0)
            setLoading(false)
        }, 300)
        return () => clearTimeout(timer)
    }, [search, isOpen, isAuthenticated])

    const handleSelect = (item) => {
        navigate(item.to)
        onClose()
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex])
                }
            } else if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, results, selectedIndex])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(4, 9, 20, 0.7)', backdropFilter: 'blur(8px)'
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{
                            position: 'fixed', top: '15%', left: '50%', zIndex: 10000,
                            width: '100%', maxWidth: '640px',
                            background: 'rgba(8, 17, 38, 0.95)', backdropFilter: 'blur(20px)',
                            border: '1px solid var(--border-hi)', borderRadius: '16px',
                            boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.1) inset',
                            overflow: 'hidden', display: 'flex', flexDirection: 'column'
                        }}
                    >
                        {/* Search Input Area */}
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Search size={22} color="var(--brand-cyan)" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search vessels, ports, or jump to view..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    flex: 1, background: 'transparent', border: 'none', color: '#fff',
                                    fontSize: '1.1rem', outline: 'none', fontFamily: '"Space Grotesk", sans-serif'
                                }}
                            />
                            {loading && <div style={{ width: 16, height: 16, border: '2px solid rgba(34,211,238,0.2)', borderTopColor: 'var(--brand-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>ESC to close</div>
                        </div>

                        {/* Search Results */}
                        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
                            {results.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                                    No results found for "{search}"
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {results.map((item, i) => {
                                        const isSelected = i === selectedIndex;
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelect(item)}
                                                onMouseEnter={() => setSelectedIndex(i)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                                    padding: '0.85rem 1rem', borderRadius: '10px',
                                                    cursor: 'pointer', transition: 'background 0.1s',
                                                    background: isSelected ? 'rgba(34,211,238,0.1)' : 'transparent',
                                                    borderLeft: `2px solid ${isSelected ? 'var(--brand-cyan)' : 'transparent'}`
                                                }}
                                            >
                                                <div style={{ color: isSelected ? '#fff' : 'var(--text-2)' }}>
                                                    {item.icon}
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-1)' }}>
                                                        {item.title}
                                                    </span>
                                                    {item.subtitle && (
                                                        <span style={{ fontSize: '0.75rem', color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--text-2)' }}>
                                                            {item.subtitle}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.type === 'link' && isSelected && (
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--brand-cyan)', fontWeight: 600 }}>JUMP</span>
                                                )}
                                                {item.type === 'vessel' && isSelected && (
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--brand-indigo)', fontWeight: 600 }}>VIEW ASSET</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
