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

  // guard against missing authState (not logged in yet)
  const profile = authState?.profile || {}; // fallback empty object

  return (
    <section className="space-y-8 text-white">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-300">
            Signed in as <span className="font-semibold">{profile.username || '—'}</span>
          </p>
          <p className="text-sm text-slate-400">Role: {profile.role || '—'}</p>
        </div>

        <button
          className="px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-400/40
                     text-red-200 font-medium hover:bg-red-500/30 transition-colors"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/30 
                        rounded-2xl p-6 space-y-3 hover:border-slate-500/50 transition-colors">
          <h3 className="text-xl font-semibold">Profile</h3>
          <p className="text-slate-300">Username: {profile.username || '—'}</p>
          <p className="text-slate-300">Role: {profile.role || '—'}</p>
        </div>

        {/* Additional Dashboard Cards */}
        {cards.map((card, index) => (
          <div 
            key={index}
            className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/30 
                       rounded-2xl p-6 space-y-3 hover:border-slate-500/50 transition-colors"
          >
            <h3 className="text-xl font-semibold">{card.title}</h3>
            <p className="text-sm text-slate-400">{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;
