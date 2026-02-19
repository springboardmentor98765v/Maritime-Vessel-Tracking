import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../../stores/slices/vesselSlice";

export default function VesselFilter() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.vessels.filters);

  const handleChange = (e) => {
    dispatch(setFilters({ [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        name="name"
        value={filters.name || ""}
        onChange={handleChange}
        placeholder="Search by Name"
        className="p-2 border rounded"
      />
      <input
        type="text"
        name="type"
        value={filters.type || ""}
        onChange={handleChange}
        placeholder="Vessel Type"
        className="p-2 border rounded"
      />
      <input
        type="text"
        name="flag"
        value={filters.flag || ""}
        onChange={handleChange}
        placeholder="Flag"
        className="p-2 border rounded"
      />
    </div>
  );
}
