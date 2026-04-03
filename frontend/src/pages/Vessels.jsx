//import Layout from "../components/Layout";
import VesselTable from "../components/VesselTable";
import VesselFilter from "../components/VesselFilter";
import { useState } from "react";
import { useLocation } from "react-router-dom";


export default function Vessels() {

  const [filters, setFilters] = useState({});
  const location = useLocation();
  const selectedVesselId = location.state?.vesselId;

  return (
    <>

      <h1></h1>

      <div className="vessel-page">

      {/* FILTER AREA */}
      <div className="filter-sticky">
        <VesselFilter filters={filters} setFilters={setFilters} />
      </div>

      {/* TABLE AREA */}
      <div className="table-scroll-area">
        <VesselTable
          filters={filters}
          selectedVesselId={selectedVesselId}
        />
      </div>

    </div> 

    </>
  );
}