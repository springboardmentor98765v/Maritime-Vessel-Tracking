import { Link } from "react-router-dom"
import { AlertTriangle } from "lucide-react"

export default function NotFoundPage() {

  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">

      {/* Icon */}
      <AlertTriangle size={80} className="text-red-500 mb-4" />

      {/* 404 Text */}
      <h1 className="text-6xl font-bold text-gray-800 mb-2">
        404
      </h1>

      {/* Message */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Page Not Found
      </h2>

      <p className="text-gray-500 mb-6 text-center max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>

      {/* Back Button */}
      <Link
        to="/home"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Go to Home
      </Link>

    </div>

  )

}
