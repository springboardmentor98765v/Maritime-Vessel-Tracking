import RegisterForm from '../components/auth/RegisterForm'

function RegisterPage() {
  return (
    <section className="grid lg:grid-cols-2 gap-10 items-center text-white min-h-[600px]">
      {/* Info Section */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Join Maritime Vista</h2>
        <p className="text-slate-300">
          Create your workspace to start tracking vessels, replay voyages, and monitor risk zones.
        </p>
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-600/30">
          <p className="text-sm"><strong>Tip:</strong> select your primary role to personalize dashboards.</p>
        </div>
      </div>
      <RegisterForm />
    </section>
  )
}

export default RegisterPage
