import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVessels } from "../stores/slices/vesselSlice";
import VesselMap from "../components/maps/VesselMap";
import VesselFilter from "../components/vessels/VesselFilter";
import VesselList from "../components/vessels/VesselList";

export default function TrackingPage() {
  const dispatch = useDispatch();
  const { vessels, loading, error, filters } = useSelector(
    (state) => state.vessels
  );

  // Fetch vessels on mount
  useEffect(() => {
    dispatch(fetchVessels());
  }, [dispatch]);

  // Filter vessels by search/filter
  const filteredVessels = vessels.filter((v) => {
    if (filters.name && !v.name.toLowerCase().includes(filters.name.toLowerCase()))
      return false;
    if (filters.flag && v.flag !== filters.flag) return false;
    if (filters.type && v.type !== filters.type) return false;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Left: Filter + List */}
      <div className="w-full md:w-1/4 p-4 bg-gray-100 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Vessel Filters</h2>
        <VesselFilter />
        <h2 className="text-xl font-semibold mt-6 mb-2">Vessels</h2>
        {loading && <p>Loading vessels...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <VesselList vessels={filteredVessels} />
      </div>

      {/* Right: Map */}
      <div className="w-full md:w-3/4 h-[90vh] md:h-full">
        <VesselMap vessels={filteredVessels} />
      </div>
    </div>
  );
}
