import LiveMap from "./LiveTracking";

function OperatorDashboard() {

  const stats = {
    activeVessels: 42,
    totalReports: 18,
    totalTasks: 9,
    totalUsers: 210,
  };

  const recentActivities = [
    { id: 1, activity: "Vessel Alpha entered Chennai Port" },
    { id: 2, activity: "Report submitted for Mumbai Dock" },
    { id: 3, activity: "New task assigned: Cargo Inspection" },
    { id: 4, activity: "Weather alert issued in Bay of Bengal" },
  ];

  return (
    <div>
      <h2 className="mb-4">Operator Dashboard</h2>

      {/* ===== KPI CARDS ===== */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white p-3 shadow">
            <h6>Active Vessels</h6>
            <h3>{stats.activeVessels}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-success text-white p-3 shadow">
            <h6>Total Reports</h6>
            <h3>{stats.totalReports}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-warning text-white p-3 shadow">
            <h6>Total Tasks</h6>
            <h3>{stats.totalTasks}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark text-white p-3 shadow">
            <h6>Total Users</h6>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>
      </div>

      {/* ===== MAP + ACTIVITY SECTION ===== */}
      <div className="row">
        {/* Map Section */}
        <div className="col-md-8">
          <div className="card p-3 shadow-sm">
            <h5 className="mb-3">Live Vessel Tracking</h5>
            <LiveMap />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              Recent Activity
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {recentActivities.map((item) => (
                  <li key={item.id} className="list-group-item">
                    {item.activity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperatorDashboard;