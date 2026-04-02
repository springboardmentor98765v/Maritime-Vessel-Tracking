import Navigation from "../components/common/Navigation"

export default function MainLayout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      <div className="sticky top-0 z-20">
        <Navigation />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="app-surface min-h-full">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
