import { NavLink } from 'react-router-dom'
import RadarDisplay from '../components/common/RadarDisplay'

function HomePage() {
  return (
    <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center text-white">
      {/* Hero Content */}
      <div className="space-y-6">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">
          Live maritime intelligence
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Track every vessel, forecast congestion, and surface safety risks in one command view.
        </h1>
        <p className="text-lg text-slate-300">
          Maritime Vista unifies live vessel tracking, port analytics, and safety overlays for
          operators, analysts, and insurers.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4">
          <NavLink 
            to="/register" 
            className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 
                       text-slate-900 font-semibold shadow-lg shadow-cyan-500/50 
                       hover:-translate-y-0.5 transition-transform"
          >
            Get started
          </NavLink>
          <NavLink 
            to="/login"
            className="px-6 py-3 rounded-full border border-white/30 text-white 
                       hover:bg-white/10 transition-colors"
          >
            Sign in
          </NavLink>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 pt-4">
          <div>
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm text-slate-400">Vessel monitoring</div>
          </div>
          <div>
            <div className="text-2xl font-bold">180+</div>
            <div className="text-sm text-slate-400">Ports analyzed</div>
          </div>
          <div>
            <div className="text-2xl font-bold">4</div>
            <div className="text-sm text-slate-400">Safety overlays</div>
          </div>
        </div>
      </div>
      
      {/* Info Panel */}
      <div className="space-y-6">
        {/* Radar Display */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 
                        backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-8">
          <RadarDisplay />
        </div>
        
        {/* Roles Card */}
        <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 
                        backdrop-blur-sm border border-white/10 rounded-2xl p-7">
          <h3 className="text-xl font-semibold mb-4">Roles supported</h3>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-full 
                             bg-white/10 text-sm">
              Operator
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full 
                             bg-white/10 text-sm">
              Analyst
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full 
                             bg-white/10 text-sm">
              Admin
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomePage
