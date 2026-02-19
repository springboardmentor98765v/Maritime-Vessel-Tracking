function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Maritime Vista</h3>
            <p className="text-slate-400 text-sm">
              Real-time vessel tracking, port congestion analytics, and safety overlays.
            </p>
          </div>
          
          <div className="text-slate-400 text-sm space-y-1 md:text-right">
            <p>© 2026 Maritime Vista</p>
            <p>All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
