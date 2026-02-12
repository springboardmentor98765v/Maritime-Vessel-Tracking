import RegisterForm from '../components/auth/RegisterForm'

function RegisterPage() {
  return (
    <section className="auth-layout">
      <div className="auth-layout__info">
        <h1>Join Maritime Vista</h1>
        <p>
          Create your workspace to start tracking vessels, replay voyages, and monitor risk zones.
        </p>
        <div className="auth-highlight">
          <strong>Tip:</strong> select your primary role to personalize dashboards.
        </div>
      </div>
      <RegisterForm />
    </section>
  )
}

export default RegisterPage
