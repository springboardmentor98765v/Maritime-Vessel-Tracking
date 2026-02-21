import { NavLink } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <div className="footer__brand">Maritime Vista</div>
          <div className="footer__tagline">
            Live vessel tracking · Port analytics · Safety overlays
          </div>
        </div>

        <nav className="footer__links" aria-label="Footer navigation">
          <NavLink to="/map">Live Map</NavLink>
          <NavLink to="/vessels">Vessels</NavLink>
          <NavLink to="/ports">Ports</NavLink>
        </nav>

        <div className="footer__copy">
          © 2026 Maritime Vista. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
