import LoginForm from '../components/auth/LoginForm'

function LoginPage() {
  return (
    <section className="auth-layout">
      <div className="auth-layout__info">
        <h1>Welcome back</h1>
        <p>
          Review live vessel movement, port congestion, and safety overlays tailored to your role.
        </p>
        <tittle>Login</tittle>
        <button>Login</button>
        <div className="auth-highlight">
          <strong>Next up:</strong> connect live maritime feeds and enable alert subscriptions.
        </div>
      </div>
      <LoginForm />
    </section>
  )
}

export default LoginPage
