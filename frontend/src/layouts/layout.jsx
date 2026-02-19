import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function Layout() {
  return (
    <div className="flex h-screen">

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6 bg-gray-100 flex-1">
          <Outlet />
        </div>
      </div>

    </div>
  )
}
