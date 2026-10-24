import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Loader'

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
}

export default function Signup() {
  const { signup, authLoading, authError, setAuthError } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setAuthError('')
    if (form.password !== form.confirmPassword) {
      setAuthError('Passwords do not match')
      return
    }
    try {
      await signup(form)
      showToast('Account created — sign in to start ordering.', 'success')
      navigate('/login')
    } catch {
      // authError already set by context
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-side">
        <div className="auth-side-quote">
          Tell us where to <span>ship your harvest.</span> Registered buyers get order tracking,
          wishlists, and restock alerts.
        </div>
        <div className="auth-stat-row">
          <div className="auth-stat">
            <b>2 min</b>
            <span>To sign up</span>
          </div>
          <div className="auth-stat">
            <b>Free</b>
            <span>Buyer account</span>
          </div>
        </div>
      </aside>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h1>Create your account</h1>
          <p>Fresh produce, direct from the field, at your door.</p>

          {authError && <div className="form-error">{authError}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full name</label>
              <input id="fullName" className="form-input" required value={form.fullName} onChange={update('fullName')} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" type="email" className="form-input" required autoComplete="email" value={form.email} onChange={update('email')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone</label>
                <input id="phone" className="form-input" value={form.phone} onChange={update('phone')} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input id="password" type="password" className="form-input" required autoComplete="new-password" value={form.password} onChange={update('password')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type="password" className="form-input" required autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Delivery address</label>
              <input id="address" className="form-input" value={form.address} onChange={update('address')} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="city">City</label>
                <input id="city" className="form-input" value={form.city} onChange={update('city')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="state">State</label>
                <input id="state" className="form-input" value={form.state} onChange={update('state')} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="country">Country</label>
                <input id="country" className="form-input" value={form.country} onChange={update('country')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pincode">Pincode</label>
                <input id="pincode" className="form-input" value={form.pincode} onChange={update('pincode')} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
              {authLoading ? <Spinner /> : <UserPlus size={16} />}
              {authLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
