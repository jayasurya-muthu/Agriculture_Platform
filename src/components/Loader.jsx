export function Spinner({ dark = false }) {
  return <span className={`spinner${dark ? ' spinner-dark' : ''}`} role="status" aria-label="Loading" />
}

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Spinner dark />
        <span className="freshness-label">{label}</span>
      </div>
    </div>
  )
}
