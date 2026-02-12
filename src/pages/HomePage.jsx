import { NavLink } from 'react-router-dom'

function HomePage() {
  return (
    <section className="hero">
      <div className="hero__content">
        <div className="eyebrow">Live maritime intelligence</div>
        <h1 className="hero__title">
          Track every vessel, forecast congestion, and surface safety risks in one command view.
        </h1>
        <p className="hero__subtitle">
          Maritime Vista unifies live vessel tracking, port analytics, and safety overlays for
          operators, analysts, and insurers.
        </p>
        <div className="hero__cta">
          <NavLink to="/register" className="button button--primary">
            Get started
          </NavLink>
          <NavLink to="/login" className="button button--ghost">
            Sign in
          </NavLink>
        </div>
        <div className="hero__stats">
          <div>
            <div className="stat-value">24/7</div>
            <div className="stat-label">Vessel monitoring</div>
          </div>
          <div>
            <div className="stat-value">180+</div>
            <div className="stat-label">Ports analyzed</div>
          </div>
          <div>
            <div className="stat-value">4</div>
            <div className="stat-label">Safety overlays</div>
          </div>
        </div>
      </div>
      <div className="hero__panel">
        <div className="panel-card panel-card--accent">
          <h3>Roles supported</h3>
          <div className="role-grid">
            <span>Operator</span>
            <span>Analyst</span>
            <span>Admin</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomePage
