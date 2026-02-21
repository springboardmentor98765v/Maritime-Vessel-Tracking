import { NavLink } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <NavLink to="/" className="btn btn--primary">← Back to overview</NavLink>
    </div>
  )
}

export default NotFoundPage
