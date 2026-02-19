import { useEffect, useState } from "react"

export default function UsersPage() {

  const [users, setUsers] = useState([])

  useEffect(() => {

    const storedUsers =
      JSON.parse(localStorage.getItem("users")) || []

    setUsers(storedUsers)

  }, [])

  return (

    <div className="p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Users Management
      </h1>

      {users.length === 0 ? (

        <p className="text-gray-400">
          No users found
        </p>

      ) : (

        <div className="bg-slate-800 rounded-lg overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-700">

              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
              </tr>

            </thead>

            <tbody>

              {users.map((user) => (

                <tr
                  key={user.id}
                  className="border-t border-gray-700"
                >

                  <td className="p-3">
                    {user.id}
                  </td>

                  <td className="p-3">
                    {user.username}
                  </td>

                  <td className="p-3">
                    {user.email}
                  </td>

                  <td className="p-3 capitalize">
                    {user.role}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  )

}
