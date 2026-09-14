import { useMemo } from 'react'

const DAY = 1000 * 60 * 60 * 24
const DEFAULT_WINDOW_DAYS = 10

/**
 * Reads a product's harvest_date / expiry_date straight from the schema and
 * renders it as a small ring — the market's version of "how fresh is this,
 * really" instead of a generic "in stock" pill.
 */
export default function FreshnessRing({ harvestDate, expiryDate, size = 40 }) {
  const data = useMemo(() => {
    if (!harvestDate) return null
    const harvest = new Date(harvestDate)
    if (Number.isNaN(harvest.getTime())) return null

    const now = new Date()
    const daysSince = Math.max(0, Math.round((now - harvest) / DAY))

    let windowDays = DEFAULT_WINDOW_DAYS
    if (expiryDate) {
      const expiry = new Date(expiryDate)
      if (!Number.isNaN(expiry.getTime())) {
        windowDays = Math.max(1, Math.round((expiry - harvest) / DAY))
      }
    }

    const pct = Math.min(1, Math.max(0, 1 - daysSince / windowDays))
    const level = pct >= 0.6 ? 'high' : pct >= 0.3 ? 'mid' : 'low'
    const label =
      daysSince === 0
        ? 'Harvested today'
        : daysSince === 1
        ? 'Harvested yesterday'
        : `Harvested ${daysSince}d ago`

    return { pct, level, label, daysSince }
  }, [harvestDate, expiryDate])

  if (!data) return null

  const stroke = 3.5
  const r = size / 2 - stroke
  const c = 2 * Math.PI * r
  const dash = c * data.pct
  const colorVar =
    data.level === 'high'
      ? 'var(--color-leaf)'
      : data.level === 'mid'
      ? 'var(--color-wheat-deep)'
      : 'var(--color-clay)'

  return (
    <div
      className="freshness-ring"
      title={`${data.label} · freshness ${Math.round(data.pct * 100)}%`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(251,247,237,0.85)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colorVar}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="freshness-ring-leaf" aria-hidden="true">
        🌿
      </span>
    </div>
  )
}

export function FreshnessLabel({ harvestDate, expiryDate }) {
  const data = useMemo(() => {
    if (!harvestDate) return null
    const harvest = new Date(harvestDate)
    if (Number.isNaN(harvest.getTime())) return null
    const now = new Date()
    const daysSince = Math.max(0, Math.round((now - harvest) / DAY))
    return daysSince === 0
      ? 'Harvested today'
      : daysSince === 1
      ? 'Harvested yesterday'
      : `Harvested ${daysSince} days ago`
  }, [harvestDate, expiryDate])

  if (!data) return null
  return <span className="freshness-label">{data}</span>
}
