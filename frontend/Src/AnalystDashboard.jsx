import PortAnalytics from "./PortAnalysis";
import ShipsGrowth from "./ShipGrowthChart";

function AnalystDashboard() {
  return (
    <div>
      <h2>Analyst Dashboard</h2>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <PortAnalytics />
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <ShipsGrowth />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalystDashboard;
