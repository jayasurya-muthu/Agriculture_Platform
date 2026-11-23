import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="not-found">
      <div>
        <Sprout size={44} strokeWidth={1.2} color="var(--color-leaf)" />
        <h1 style={{ fontSize: 28, margin: '16px 0 8px' }}>This field is empty</h1>
        <p style={{ color: 'var(--color-ink-soft)', marginBottom: 22 }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="btn btn-primary">Back to browse</Link>
      </div>
    </div>
  )
}
