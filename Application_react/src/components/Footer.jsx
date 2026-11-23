import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Sprout size={18} color="var(--color-wheat)" />
              <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cream)', fontSize: 16, fontWeight: 600 }}>
                Global Agriculture
              </span>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 260 }}>
              A direct line between growers and kitchens — order produce the day it's picked,
              from farms registered on our marketplace.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/">Browse produce</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/orders">Track an order</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/profile">Your profile</Link></li>
              <li><Link to="/notifications">Notifications</Link></li>
              <li><Link to="/signup">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li>surya@globalagriculture.example</li>
              <li>+91 6385529199</li>
              <li>Mon–Sat, 8am–8pm</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Global Agriculture. All produce, no middlemen.</span>
          <span className="eyebrow" style={{ color: 'var(--color-wheat)' }}>Grown local · Shipped fresh</span>
        </div>
      </div>
    </footer>
  )
}
