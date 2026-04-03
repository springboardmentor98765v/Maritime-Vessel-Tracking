import LiveMap from "./LiveTracking";
import PortAnalytics from "./PortAnalysis";
import ShipsGrowth from "./ShipsGrowth";

function AdminDashboard() {

  const stats = {
    totalUsers: 1240,
    totalReports: 320,
    totalTasks: 87,
  };

  const recentActivities = [
    { id: 1, name: "Rahul Sharma", role: "Operator", action: "Submitted Port Report" },
    { id: 2, name: "Anjali Verma", role: "Analyst", action: "Updated Vessel Data" },
    { id: 3, name: "Vikram Rao", role: "Operator", action: "Completed Task" },
    { id: 4, name: "Sneha Patel", role: "Analyst", action: "Generated Analytics Report" },
  ];

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* ===== KPI CARDS ===== */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white p-3 shadow">
            <h6>Total Users</h6>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-success text-white p-3 shadow">
            <h6>Total Reports</h6>
            <h3>{stats.totalReports}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-danger text-white p-3 shadow">
            <h6>Total Tasks</h6>
            <h3>{stats.totalTasks}</h3>
          </div>
        </div>
      </div>

      {/* ===== RECENT ACTIVITY TABLE ===== */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-dark text-white">
          Recent Activity
        </div>

        <div className="card-body p-0">
          <table className="table table-striped mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.name}</td>
                  <td>{activity.role}</td>
                  <td>{activity.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MAP SECTION ===== */}
      <div className="card p-3 shadow-sm mb-4">
        <h5>Live Vessel Tracking</h5>
        <LiveMap />
      </div>

      {/* ===== ANALYTICS SECTION ===== */}
      <div className="row">
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

export default AdminDashboard;

