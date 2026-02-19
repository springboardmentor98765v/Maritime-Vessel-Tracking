import Sidebar from "../components/common/Sidebar"
import Navigation from "../components/common/Navigation"

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navigation />

        <div className="flex-1 p-6 bg-gray-100 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
