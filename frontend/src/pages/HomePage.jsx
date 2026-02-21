import { NavLink } from 'react-router-dom'
import RadarDisplay from '../components/common/RadarDisplay'

function HomePage() {
  return (
    <div className="hero">
      {/* ─── Left: Content ─── */}
      <div className="hero__content">
        <span className="hero__eyebrow">
          <span>●</span> Live maritime intelligence
        </span>

        <h1 className="hero__title">
          Track every vessel,<br />
          forecast congestion,<br />
          surface safety risks.
        </h1>

        <p className="hero__sub">
          Maritime Vista unifies live vessel tracking, port analytics, and safety
          overlays for operators, analysts, and fleet managers — in one command view.
        </p>

        <div className="hero__cta">
          <NavLink to="/register" className="btn btn--primary btn--lg">
            Get started free
          </NavLink>
          <NavLink to="/map" className="btn btn--ghost btn--lg">
            View live map →
          </NavLink>
        </div>

        {/* Stats row */}
        <div className="hero__stats">
          <div className="stat">
            <div className="stat__value">24/7</div>
            <div className="stat__label">Vessel monitoring</div>
          </div>
          <div className="stat">
            <div className="stat__value">180+</div>
            <div className="stat__label">Ports analyzed</div>
          </div>
          <div className="stat">
            <div className="stat__value">4</div>
            <div className="stat__label">Safety overlays</div>
          </div>
        </div>
      </div>

      {/* ─── Right: Panel ─── */}
      <div className="hero__panel">
        <div className="radar-card">
          <RadarDisplay />
        </div>

        <div className="roles-card">
          <h3>Built for maritime professionals</h3>
          <div className="role-tags">
            <span className="role-tag">🧭 Fleet Operator</span>
            <span className="role-tag">📊 Data Analyst</span>
            <span className="role-tag">🛡️ Safety Officer</span>
            <span className="role-tag">⚓ Port Manager</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
