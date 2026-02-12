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
  const { authState } = useAuth()

  return (
    <section className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1>Operator dashboard</h1>
          <p>
            {authState?.profile?.name
              ? `Signed in as ${authState.profile.name}`
              : 'Signed in and ready to configure live tracking.'}
          </p>
        </div>
        <button className="button button--ghost" type="button">
          Configure data feeds
        </button>
      </div>
      <div className="dashboard__grid">
        {cards.map((card) => (
          <article key={card.title} className="dashboard-card">
            <h3>{card.title}</h3>
            <p>{card.detail}</p>
            <button className="button button--link" type="button">
              Configure
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DashboardPage
