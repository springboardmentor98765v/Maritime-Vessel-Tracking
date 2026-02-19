import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { loginUser } from "../../stores/actions/authActions";

import ReCAPTCHA from "react-google-recaptcha"

export default function RegisterForm() {


  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    isLoading,
    isAuthenticated
  } = useSelector(state => state.auth)

  const [captchaValue, setCaptchaValue] = useState(null)

  const [form, setForm] = useState({
    username: "",
    password: ""
  })

  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  // ✅ Navigate AFTER login success
  useEffect(() => {

    if (isAuthenticated) {

      navigate("/dashboard")

    }

  }, [isAuthenticated, navigate])


  // Handle input change
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    })

  }


  // Handle login submit
  const handleSubmit = async (e) => {

    e.preventDefault()

    setError("")
    setMessage("")

    if (!captchaValue) {

      setError("Please verify captcha")
      return

    }

    try {

      await dispatch(
        loginUser(
          form.username,
          form.password
        )
      )

      setMessage("Login Successful ✅")

    }
    catch (err) {

      setError(
        err?.response?.data?.detail ||
        "Invalid username or password"
      )

    }

  }


  return (

    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/ship.jpg')" }}
    >

      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 text-center mb-10">

        <h1 className="glow-title">
          Maritime Vessel Tracking
        </h1>

        <p className="glow-subtitle">
          Analytics & Safety Platform
        </p>

      </div>


      <div className="relative z-10 glass-card text-white w-96 p-6 rounded-xl">

        <h2 className="text-2xl font-bold text-center mb-4">
          Login
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="username"
            placeholder="Enter Username"
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
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >

              {
                showPassword
                  ? <EyeOff size={20}/>
                  : <Eye size={20}/>
              }

            </div>

          </div>


          <div className="flex justify-center mt-4">

            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(value) =>
                setCaptchaValue(value)
              }
            />

          </div>


          {
            error &&
            <p className="text-red-400 mt-2">
              {error}
            </p>
          }

          {
            message &&
            <p className="text-green-400 mt-2">
              {message}
            </p>
          }


          <button
            type="submit"
            disabled={isLoading}
            className="login-btn w-full mt-4"
          >

            {
              isLoading
                ? "Signing in..."
                : "Signin"
            }

          </button>
<p className="text-center mt-3">
  Don't have account?
  <span
    className="text-blue-400 cursor-pointer ml-1"
    onClick={() => navigate("/login")}
  >
    Register
  </span>
</p>
        </form>

      </div>

      <div className="wave"></div>

    </div>

  )

}
