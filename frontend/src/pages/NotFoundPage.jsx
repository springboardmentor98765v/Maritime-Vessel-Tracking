import { NavLink } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[600px] text-center text-white space-y-6">
      <h1 className="text-4xl md:text-5xl font-bold">Route not found</h1>
      <p className="text-lg text-slate-300 max-w-md">The page you are looking for does not exist.</p>
      <NavLink 
        className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 
                   text-slate-900 font-semibold shadow-lg shadow-cyan-500/50 
                   hover:-translate-y-0.5 transition-transform" 
        to="/">
        Back to overview
      </NavLink>
    </section>
  )
}

export default NotFoundPage
