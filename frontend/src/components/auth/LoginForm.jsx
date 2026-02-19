import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import ReCAPTCHA from "react-google-recaptcha"

export default function LoginForm({
  onSubmit,
  isLoading,
  error,
  message
}) {

  const [form, setForm] = useState({
    username: "",
    password: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [captchaValue, setCaptchaValue] = useState(null)
  const [localError, setLocalError] = useState("")

  // Handle input change
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    })

  }

  // Handle submit
  const handleSubmit = (e) => {

    e.preventDefault()

    setLocalError("")

    if (!captchaValue) {
      setLocalError("Please verify captcha")
      return
    }

    onSubmit(form)

  }

  return (

    <div className="glass-card text-white w-96 p-6 rounded-xl">

      <h2 className="text-2xl font-bold text-center mb-4">
        Login
      </h2>

      <form onSubmit={handleSubmit}>

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={form.username}
          onChange={handleChange}
          required
          className="input"
        />

        {/* Password */}
        <div className="relative">

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
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

        {/* CAPTCHA */}
        <div className="flex justify-center mt-3">

          <ReCAPTCHA
            sitekey="6LcLs24sAAAAAL-HVkAoTr6wzmxwHyR0Nmja4Ruw"
            onChange={(value) =>
              setCaptchaValue(value)
            }
          />

        </div>

        {/* Local Error */}
        {
          localError &&
          <p className="text-red-400 mt-2">
            {localError}
          </p>
        }

        {/* Backend Error */}
        {
          error &&
          <p className="text-red-400 mt-2">
            {error}
          </p>
        }

        {/* Success Message */}
        {
          message &&
          <p className="text-green-400 mt-2">
            {message}
          </p>
        }

        {/* Submit Button */}
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

      </form>

    </div>

  )

}
