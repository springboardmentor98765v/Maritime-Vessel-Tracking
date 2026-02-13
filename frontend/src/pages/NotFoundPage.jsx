import { NavLink } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>Route not found</h1>
      <p>The page you are looking for does not exist.</p>
      <NavLink className="button button--primary" to="/">
        Back to overview
      </NavLink>
    </section>
  )
}

export default NotFoundPage
