import RegisterForm from '../components/auth/RegisterForm'

function RegisterPage() {
  return (
    <div className="auth-wrapper">
      {/* Info panel */}
      <div className="auth-info">
        <h2>Join Maritime Vista</h2>
        <p>
          Create your workspace to start tracking vessels, replay voyages, and monitor
          risk zones worldwide — all in one command center.
        </p>
        <div className="auth-feature">
          <div className="auth-feature-icon auth-feature-icon--vessel">GT</div>
          <div>Global vessel tracking across all ocean regions</div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon auth-feature-icon--port">PA</div>
          <div>Port congestion dashboards with live scores</div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon auth-feature-icon--safety">AL</div>
          <div>Subscribe to vessels and receive instant alerts</div>
        </div>
      </div>

      {/* Register form card */}
      <RegisterForm />
    </div>
  )
}

export default RegisterPage
