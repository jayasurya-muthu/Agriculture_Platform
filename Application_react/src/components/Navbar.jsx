import { useEffect, useState, useCallback } from 'react'
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Search, ShoppingBasket, Heart, Bell, User, LogOut, Menu, X, LayoutDashboard, Receipt } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getUnreadCount } from '../api/notifications'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [unread, setUnread] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setQuery(location.pathname === '/' ? searchParams.get('q') || '' : '')
  }, [location.pathname, searchParams])

  const refreshUnread = useCallback(() => {
    if (!user) return
    getUnreadCount(user.userId)
      .then((res) => setUnread(res.count || 0))
      .catch(() => { })
  }, [user])

  useEffect(() => {
    refreshUnread()
    const id = setInterval(refreshUnread, 45000)
    return () => clearInterval(id)
  }, [refreshUnread, location.pathname])

  const submitSearch = (e) => {
    e.preventDefault()
    navigate(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : '/')
    setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setMobileOpen(false)}>
    <span className="brand-mark">
    <img src="/images/agriculture.jpg" alt="Global Agriculture Logo" />
  </span>
          <span className="brand-text">
            Global Agriculture
            <span>Farm to door</span>
          </span>
        </Link>

        <form className="nav-search" onSubmit={submitSearch}>
          <Search size={16} />
          <input
            type="search"
            placeholder="Search mangoes, wheat, turmeric…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <button
          className="mobile-nav-toggle btn-icon btn-outline"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{ marginLeft: 'auto' }}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <nav className={`nav-links${mobileOpen ? ' nav-links-open' : ''}`}>
          <NavLink to="/" end className="nav-link" onClick={() => setMobileOpen(false)}>
            <span className="nav-label">Products</span>
          </NavLink>

          {user && (
            <NavLink to="/orders" className="nav-link" onClick={() => setMobileOpen(false)}>
              <Receipt size={16} />
              <span className="nav-label">Orders</span>
            </NavLink>
          )}

          {user && (
            <NavLink to="/wishlist" className="nav-link" onClick={() => setMobileOpen(false)}>
              <Heart size={16} />
              <span className="nav-label">Wishlist</span>
            </NavLink>
          )}

          {user && (
            <NavLink to="/notifications" className="nav-link" onClick={() => setMobileOpen(false)}>
              <Bell size={16} />
              <span className="nav-label">Alerts</span>
              {unread > 0 && <span className="nav-badge">{unread > 9 ? '9+' : unread}</span>}
            </NavLink>
          )}

          {user && (
            <NavLink to="/cart" className="nav-link" onClick={() => setMobileOpen(false)}>
              <ShoppingBasket size={16} />
              <span className="nav-label">Cart</span>
              {itemCount > 0 && <span className="nav-badge">{itemCount > 9 ? '9+' : itemCount}</span>}
            </NavLink>
          )}

          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className="nav-link" onClick={() => setMobileOpen(false)}>
              <LayoutDashboard size={16} />
              <span className="nav-label">Admin</span>
            </NavLink>
          )}

          {user ? (
            <>
              <NavLink to="/profile" className="nav-link" onClick={() => setMobileOpen(false)}>
                <User size={16} />
                <span className="nav-label">{user.fullName?.split(' ')[0] || 'Profile'}</span>
              </NavLink>
              <button type="button" className="nav-link" onClick={handleLogout} style={{ border: 'none', cursor: 'pointer' }}>
                <LogOut size={16} />
                <span className="nav-label">Log out</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>
                <span className="nav-label">Log in</span>
              </NavLink>
              <NavLink to="/signup" className="nav-link active" onClick={() => setMobileOpen(false)}>
                <span className="nav-label">Sign up</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
