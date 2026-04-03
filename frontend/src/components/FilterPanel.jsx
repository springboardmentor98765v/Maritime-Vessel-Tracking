export default function FilterPanel({ filters, setFilters }) {
  return (
    <div className="filter-container">

      <h3 className="filter-title">Filter Vessels</h3>

      <div className="filter-row">

        {/* Vessel Type */}
        <div className="filter-group">
          <label>Vessel Type</label>
          <select
            value={filters.vessel_type || ""}
            onChange={(e) =>
              setFilters({ ...filters, vessel_type: e.target.value })
            }
          >
            <option value="">All Types</option>
            <option value="Cargo">Cargo</option>
            <option value="Tanker">Tanker</option>
          </select>
        </div>

        {/* Flag */}
        <div className="filter-group">
          <label>Flag</label>
          <input
            placeholder="e.g. India, USA"
            value={filters.flag || ""}
            onChange={(e) =>
              setFilters({ ...filters, flag: e.target.value })
            }
          />
        </div>

        {/* Actions */}
        <div className="filter-actions">
          <button
            onClick={() => setFilters({})}
          >
            Reset
          </button>
        </div>

      </div>
    </div>
  );
}