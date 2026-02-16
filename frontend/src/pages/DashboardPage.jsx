import { useAuth } from '../hooks/useAuth'

const cards = [
  {
    title: 'Live vessel view',
    detail: 'Prepare real-time map and metadata panels for fleet oversight.',
  },
  {
    title: 'Port congestion',
    detail: 'Track berth availability, dwell times, and arrival queues.',
  },
  {
    title: 'Safety overlays',
    detail: 'Visualize storms, piracy zones, and incident alerts.',
  },
]


function DashboardPage() {
  const { authState, logout } = useAuth();

  return (
    <section className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Signed in as <strong>{authState.profile?.name}</strong>
          </p>
          <p>Role: {authState.role}</p>
        </div>

        <button
          className="button button--danger"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>

      <div className="dashboard__grid">
        <div className="dashboard-card">
          <h3>Profile</h3>
          <p>Username: {authState.profile?.name}</p>
          <p>Role: {authState.role}</p>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
