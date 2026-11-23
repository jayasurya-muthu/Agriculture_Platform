import { Link } from 'react-router-dom'
import { Heart, Plus, Minus, Sprout, ImageOff } from 'lucide-react'
import FreshnessRing from './FreshnessRing'

export default function ProductCard({
  product,
  categoryName,
  isWishlisted,
  onToggleWishlist,
  cartQty = 0,
  onAdd,
  onIncrement,
  onDecrement,
  busy,
}) {
  const outOfStock = product.status === 'Out_of_Stock' || product.stock <= 0

  return (
    <div className="product-card">
      <Link to={`/product/${product.productId}`} className="product-media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.productName} loading="lazy" />
        ) : (
          <div className="product-media-fallback">
            <Sprout size={34} strokeWidth={1.3} />
          </div>
        )}

        {outOfStock ? (
          <span className="stamp stamp-out">Sold out</span>
        ) : product.harvestDate ? (
          <span className="stamp">
            {daysAgo(product.harvestDate)}
          </span>
        ) : null}
      </Link>

      <button
        type="button"
        className={`wishlist-toggle${isWishlisted ? ' active' : ''}`}
        onClick={() => onToggleWishlist?.(product)}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      <div className="product-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span className="product-origin">{categoryName || product.countryOfOrigin || 'Farm fresh'}</span>
          {product.harvestDate && (
            <FreshnessRing harvestDate={product.harvestDate} expiryDate={product.expiryDate} size={26} />
          )}
        </div>

        <Link to={`/product/${product.productId}`}>
          <h3 className="product-name">{product.productName}</h3>
        </Link>

        <div className="product-footer">
          <div>
            <span className="price-mono">₹{Number(product.price).toFixed(2)}</span>{' '}
            <span className="price-unit">/ {product.unit || 'unit'}</span>
          </div>

          {outOfStock ? (
            <span className="badge badge-neutral">Unavailable</span>
          ) : cartQty > 0 ? (
            <div className="qty-stepper">
              <button type="button" onClick={() => onDecrement?.(product)} disabled={busy} aria-label="Decrease quantity">
                <Minus size={13} />
              </button>
              <span>{cartQty}</span>
              <button type="button" onClick={() => onIncrement?.(product)} disabled={busy} aria-label="Increase quantity">
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button type="button" className="add-btn" onClick={() => onAdd?.(product)} disabled={busy}>
              <Plus size={14} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function daysAgo(harvestDate) {
  const harvest = new Date(harvestDate)
  if (Number.isNaN(harvest.getTime())) return 'Fresh'
  const days = Math.max(0, Math.round((Date.now() - harvest) / 86400000))
  if (days === 0) return 'Picked today'
  if (days === 1) return 'Picked yesterday'
  return `Picked ${days}d ago`
}
