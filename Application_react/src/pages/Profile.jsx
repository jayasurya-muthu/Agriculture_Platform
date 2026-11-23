import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Receipt, Heart, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getOrdersByBuyer } from '../api/orders'
import { getWishlist } from '../api/wishlist'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ orders: 0, wishlist: 0 })

  useEffect(() => {
    if (!user) return
    Promise.all([
      getOrdersByBuyer(user.userId).catch(() => []),
      getWishlist(user.userId).catch(() => []),
    ]).then(([orders, wishlist]) => setStats({ orders: orders.length, wishlist: wishlist.length }))
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (user?.fullName || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 64, maxWidth: 900 }}>
      <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)', marginBottom: 20 }}>Your profile</h1>

      <div className="profile-grid">
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="profile-avatar">{initials}</div>
          <h3 style={{ fontSize: 17 }}>{user?.fullName}</h3>
          <span className="badge badge-leaf" style={{ marginTop: 8 }}>
            <ShieldCheck size={12} /> {user?.role}
          </span>

          <div className="divider" />

          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <div className="price-mono" style={{ fontSize: 20 }}>{stats.orders}</div>
              <span className="freshness-label"><Receipt size={11} style={{ verticalAlign: '-1px' }} /> Orders</span>
            </div>
            <div>
              <div className="price-mono" style={{ fontSize: 20 }}>{stats.wishlist}</div>
              <span className="freshness-label"><Heart size={11} style={{ verticalAlign: '-1px' }} /> Saved</span>
            </div>
          </div>

          <button className="btn btn-outline btn-block" style={{ marginTop: 20 }} onClick={handleLogout}>
            <LogOut size={15} /> Log out
          </button>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Account details</h3>
          <div className="profile-field"><span>Full name</span><span>{user?.fullName || '—'}</span></div>
          <div className="profile-field"><span>Email</span><span>{user?.email || '—'}</span></div>
          <div className="profile-field"><span>User ID</span><span className="price-mono">#{user?.userId}</span></div>
          <div className="profile-field"><span>Role</span><span>{user?.role}</span></div>

          <p className="freshness-label" style={{ marginTop: 16 }}>
            To update your address or phone number, contact support — self-service editing isn't
            available yet.
          </p>
        </div>
      </div>
    </div>
  )
}
