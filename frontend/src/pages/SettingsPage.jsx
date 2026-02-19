import { useState } from "react"
import { useSelector } from "react-redux"
import { Eye, EyeOff } from "lucide-react"

export default function SettingsPage() {

  const currentUser = useSelector((state) => state.auth.user)

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  // eye toggle states
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)


  // handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }


  // change password function
  const handleChangePassword = (e) => {

    e.preventDefault()

    setError("")
    setMessage("")

    const users =
      JSON.parse(localStorage.getItem("users")) || []

    const userIndex =
      users.findIndex(u => u.id === currentUser.id)

    if (userIndex === -1) {
      setError("User not found")
      return
    }

    // check current password
    if (
      users[userIndex].password !== form.currentPassword
    ) {
      setError("Current password is incorrect")
      return
    }

    // validate new password
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    // confirm password match
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // update password
    users[userIndex].password = form.newPassword

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    )

    setMessage("Password changed successfully ✅")

    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })

  }


  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Settings
      </h1>


      <div className="bg-white p-6 rounded-xl shadow-md w-96">

        <h2 className="text-lg font-semibold mb-4">
          Change Password
        </h2>


        <form onSubmit={handleChangePassword}>


          {/* Current Password */}
          <div className="relative mb-3">

            <input
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              placeholder="Current Password"
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded pr-10"
              required
            />

            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

          </div>


          {/* New Password */}
          <div className="relative mb-3">

            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded pr-10"
              required
            />

            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

          </div>


          {/* Confirm Password */}
          <div className="relative mb-3">

            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded pr-10"
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

          </div>


          {/* Error */}
          {error && (
            <p className="text-red-500 mb-2">
              {error}
            </p>
          )}


          {/* Success */}
          {message && (
            <p className="text-green-500 mb-2">
              {message}
            </p>
          )}


          {/* Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
          >
            Change Password
          </button>


        </form>

      </div>

    </div>

  )

}
