import { useEffect, useState } from "react"
import api from "../api/axios"
import { Users as UsersIcon } from "lucide-react"

export default function UsersPage() {

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {

    const fetchUsers = async () => {
      try {
        const response = await api.get("/auth/users/")
        setUsers(response.data)
      } catch (err) {
        console.error("Failed to load users", err)
        setError("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()

  }, [])

  return (

    <div className="page-shell">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">
            Admin-only user directory for roles and access management.
          </p>
        </div>
        <span className="pill border-slate-200 text-slate-700 bg-white">
          <UsersIcon size={14} />
          {users.length} users
        </span>
      </div>

      {loading && (
        <div className="text-sm text-slate-600">
          Loading users…
        </div>
      )}

      {error && !loading && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="text-sm text-slate-600">
          No users found
        </div>
      )}

      {!loading && !error && users.length > 0 && (

        <div className="card">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-3 pr-4">ID</th>
                    <th className="py-3 pr-4">Username</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="py-3 pr-4 font-mono text-sm text-slate-700">
                        {user.id}
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-900">
                        {user.username}
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-700">
                        {user.email || "-"}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="pill border-slate-200 bg-white text-slate-700 capitalize">
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      )}

    </div>

  )

}
