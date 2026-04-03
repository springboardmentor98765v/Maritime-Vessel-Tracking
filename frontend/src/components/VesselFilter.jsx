export default function VesselFilter({ filters, setFilters }) {

  const handleChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <div className="filter-container">

      <h3 className="filter-title">🔎 Vessel Filters</h3>

      <div className="filter-row">

        {/* Vessel Type */}
        <div className="filter-group">
          <label>Vessel Type</label>
          <select
            value={filters.vessel_type || ""}
            onChange={(e) => handleChange("vessel_type", e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Cargo">Cargo</option>
            <option value="Tanker">Tanker</option>
            <option value="Container">Container</option>
          </select>
        </div>

        {/* Flag */}
        <div className="filter-group">
          <label>Flag Country</label>
          <input
            type="text"
            placeholder="Ex: India"
            value={filters.flag || ""}
            onChange={(e) => handleChange("flag", e.target.value)}
          />
        </div>

        {/* Reset Button */}
        <div className="filter-actions">
          <button onClick={resetFilters}>
            Reset
          </button>
        </div>

      </div>

    </div>
  );
}