import { useState } from 'react';

const FilterPanel = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    vessel_type: '',
    flag: '',
    cargo_type: '',
    destination: '',
  });

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);

    // Remove empty values before sending
    const clean = Object.fromEntries(
      Object.entries(updated).filter(([_, v]) => v !== '')
    );
    onFilterChange(clean);
  };

  const handleReset = () => {
    setFilters({ vessel_type: '', flag: '', cargo_type: '', destination: '' });
    onFilterChange({});
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
  };

  return (
    <div style={{
      width: '220px',
      background: '#1e2a3a',
      color: '#fff',
      padding: '16px',
      height: '100%',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ marginBottom: '16px' }}>🔍 Filter Vessels</h3>

      <label>Vessel Type</label>
      <select name="vessel_type" value={filters.vessel_type} onChange={handleChange} style={inputStyle}>
        <option value="">All</option>
        <option value="Container">Container</option>
        <option value="Tanker">Tanker</option>
        <option value="Cargo">Cargo</option>
        <option value="Bulk Carrier">Bulk Carrier</option>
      </select>

      <label>Flag</label>
      <input
        name="flag"
        placeholder="e.g. India"
        value={filters.flag}
        onChange={handleChange}
        style={inputStyle}
      />

      <label>Cargo Type</label>
      <input
        name="cargo_type"
        placeholder="e.g. Oil"
        value={filters.cargo_type}
        onChange={handleChange}
        style={inputStyle}
      />

      <label>Destination</label>
      <input
        name="destination"
        placeholder="e.g. Mumbai"
        value={filters.destination}
        onChange={handleChange}
        style={inputStyle}
      />

      <button
        onClick={handleReset}
        style={{
          width: '100%',
          padding: '8px',
          background: '#e53935',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FilterPanel;