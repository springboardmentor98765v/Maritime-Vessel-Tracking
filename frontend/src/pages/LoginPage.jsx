import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { loginSuccess } from "../stores/slices/authSlice"
import ReCAPTCHA from "react-google-recaptcha"
import api from "../api/axios"


export default function LoginPage() {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [isSignup, setIsSignup] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isResetStep2, setIsResetStep2] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false)

  const [captchaValue, setCaptchaValue] = useState(null)

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "operator"
  })

  const [resetEmail, setResetEmail] = useState("")
  const [resetPassword, setResetPassword] = useState("")
  const [resetConfirmPassword, setResetConfirmPassword] = useState("")

  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // ================= LOGIN / SIGNUP =================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    const users = JSON.parse(localStorage.getItem("users")) || []

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    // ================= SIGNUP =================
    if (isSignup) {

      if (!form.username) {
        setError("Username is required")
        return
      }

      if (!form.email) {
        setError("Email is required")
        return
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match")
        return
      }

      try {
        const response = await api.post("/auth/register/", {
          email: form.email,
          username: form.username,
          password: form.password,
          role: form.role,
        })

        // Try to surface backend success message if any
        const backendMessage =
          response.data?.message || "Signup Successful ✅"
        setMessage(backendMessage)
        setIsSignup(false)
      } catch (err) {
        // Try to pull a helpful message from DRF response
        const data = err.response?.data
        let msg = ""

        if (data && typeof data === "object") {
          const firstKey = Object.keys(data)[0]
          const value = data[firstKey]
          if (Array.isArray(value)) {
            msg = value[0]
          } else if (typeof value === "string") {
            msg = value
          } else if (typeof data.message === "string") {
            msg = data.message
          } else if (typeof data.detail === "string") {
            msg = data.detail
          }
        }

        setError(msg || "Signup failed")
      }
      return
    }

    // ================= CAPTCHA CHECK =================
    if (!captchaValue) {
      setError("Please verify captcha")
      return
    }

    // ================= LOGIN =================
    try {
      const response = await api.post("/auth/login/", {
        username: form.username,
        password: form.password,
      })

      const tokens = response.data?.data?.tokens
      const userData = response.data?.data?.user

      if (!tokens?.access || !tokens?.refresh) {
        setError("Login response missing tokens")
        return
      }

      localStorage.setItem(import.meta.env.VITE_JWT_TOKEN_KEY, tokens.access)
      localStorage.setItem(import.meta.env.VITE_REFRESH_TOKEN_KEY, tokens.refresh)

      dispatch(
        loginSuccess({
          user: userData || { username: form.username },
          token: tokens.access,
        }),
      )

      navigate("/dashboard")
    } catch (err) {
      const backendMessage =
        err.response?.data?.message || err.response?.data?.detail
      setError(backendMessage || "Login failed")
    }
  }

  // ================= FORGOT PASSWORD =================
  const handleCheckEmail = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!resetEmail) {
      setError("Email is required")
      return
    }

    try {
      await api.post("/auth/check-email/", { email: resetEmail })
      setIsResetStep2(true)
      setError("")
      setMessage("")
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || "Email not registered")
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!resetEmail) {
      setError("Email is required")
      return
    }

    if (resetPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (resetPassword !== resetConfirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const response = await api.post("/auth/reset-password/", {
        email: resetEmail,
        new_password: resetPassword
      })

      setMessage(response.data?.message || "Password reset successful ✅")
      setIsForgotPassword(false)
      setIsResetStep2(false)
      setResetPassword("")
      setResetConfirmPassword("")
      setResetEmail("")
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || "Failed to reset password")
    }
  }

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/ship.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Title */}
      <div className="relative z-10 text-center mb-10">
        <h1 className="glow-title">Maritime Vessel Tracking</h1>
        <p className="glow-subtitle">Analytics & Safety Platform</p>
      </div>

      {/* Card */}
      <div className="relative z-10 glass-card text-white w-96 p-6 rounded-xl">

        <h2 className="text-2xl font-bold text-center mb-4">
          {isForgotPassword ? "Reset Password" : isSignup ? "Signup" : "Login"}
        </h2>

        {!isForgotPassword ? (

          <form onSubmit={handleSubmit}>

            {isSignup && (
              <input
                type="email"
                name="email"
                placeholder="Enter Email Address"
                value={form.email}
                onChange={handleChange}
                required
                className="input"
              />
            )}

            <input
              type="text"
              name="username"
              placeholder={isSignup ? "Enter Username" : "Email or Username"}
              value={form.username}
              onChange={handleChange}
              required
              className="input"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                value={form.password}
                onChange={handleChange}
                required
                className="input"
              />
              <div
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
              </div>
            </div>

            {isSignup && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
            )}
            {isSignup && (
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input"
              >
                <option value="operator" className="text-black bg-white">Operator</option>
                <option value="analyst" className="text-black bg-white">Analyst</option>
                <option value="admin" className="text-black bg-white">Admin</option>
              </select>
            )}
            {!isSignup && (
              <>
                <div className="flex justify-center mt-3">
                  <ReCAPTCHA
                    sitekey="6LcLs24sAAAAAL-HVkAoTr6wzmxwHyR0Nmja4Ruw"
                    onChange={(value) => setCaptchaValue(value)}
                  />
                </div>

                <p
                  className="text-blue-400 text-sm mt-2 cursor-pointer text-right"
                  onClick={() => setIsForgotPassword(true)}
                >
                  Forgot Password?
                </p>
              </>
            )}

            {error && <p className="text-red-400 mt-2">{error}</p>}
            {message && <p className="text-green-400 mt-2">{message}</p>}

            <button className="login-btn w-full mt-4">
              {isSignup ? "Signup" : "Signin"}
            </button>

            <p className="text-center mt-3">
              {isSignup ? "Already have account?" : "Don't have account?"}
              <span
                onClick={() => setIsSignup(!isSignup)}
                className="text-blue-400 cursor-pointer ml-2"
              >
                {isSignup ? "Signin" : "Signup"}
              </span>
            </p>

          </form>

        ) : (

          <form onSubmit={isResetStep2 ? handleResetPassword : handleCheckEmail}>

            {!isResetStep2 ? (
              <>
                <input
                  type="email"
                  placeholder="Enter Registered Email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="input"
                />

                {error && <p className="text-red-400 mt-2">{error}</p>}
                {message && <p className="text-green-400 mt-2">{message}</p>}

                <button className="login-btn w-full mt-4">
                  Verify Email
                </button>
              </>
            ) : (
              <>
                <input
                  type="email"
                  value={resetEmail}
                  disabled
                  className="input opacity-70 cursor-not-allowed bg-slate-100 text-slate-500"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  required
                  className="input"
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  required
                  className="input"
                />

                {error && <p className="text-red-400 mt-2">{error}</p>}
                {message && <p className="text-green-400 mt-2">{message}</p>}

                <button className="login-btn w-full mt-4">
                  Reset Password
                </button>
              </>
            )}

            <p
              className="text-blue-400 text-sm mt-3 cursor-pointer text-center"
              onClick={() => {
                setIsForgotPassword(false)
                setIsResetStep2(false)
                setResetPassword("")
                setResetConfirmPassword("")
                setResetEmail("")
                setError("")
                setMessage("")
              }}
            >
              Back to Login
            </p>

          </form>

        )}
      </div>

      {/* Wave */}
      <div className="wave"></div>

    </div>
  )
}
