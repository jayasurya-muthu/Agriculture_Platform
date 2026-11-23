import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Loader'

export default function Login() {
  const { login, authLoading, authError, setAuthError } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setAuthError('')
    try {
      const loggedIn = await login(form.email, form.password)
      showToast(`Welcome back, ${loggedIn.fullName?.split(' ')[0] || 'there'}!`, 'success')
      const dest = loggedIn.role === 'ADMIN' ? '/admin' : location.state?.from || '/'
      navigate(dest, { replace: true })
    } catch {
      // authError already set by context
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-side">
        <div className="auth-side-quote">
          Order the harvest, <span>not the warehouse.</span> Every listing here comes straight
          from a registered farm.
        </div>
        <div className="auth-stat-row">
          <div className="auth-stat">
            <b>7</b>
            <span>Produce categories</span>
          </div>
          <div className="auth-stat">
            <b>24h</b>
            <span>Average dispatch</span>
          </div>
          <div className="auth-stat">
            <b>0</b>
            <span>Middlemen</span>
          </div>
        </div>
      </aside>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h1>Sign in</h1>
          <p>Enter your account details to keep ordering.</p>

          {authError && <div className="form-error">{authError}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                required
                autoComplete="off"
                placeholder="Enter your email"
                value={form.email}
                onChange={update('email')}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                required
                autoComplete="new-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={update('password')}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
              {authLoading ? <Spinner /> : <LogIn size={16} />}
              {authLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            New to Global Agriculture? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
