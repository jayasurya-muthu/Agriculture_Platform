import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Minus, Plus, ArrowLeft, MapPin, Star, Sprout, ShoppingBasket } from 'lucide-react'
import { getProductById } from '../api/products'
import { getAllReviews } from '../api/reviews'
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useProducts } from '../context/ProductsContext'
import FreshnessRing, { FreshnessLabel } from '../components/FreshnessRing'
import PageLoader from '../components/Loader'
import EmptyState from '../components/EmptyState'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { categoryById } = useProducts()
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCart()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [reviews, setReviews] = useState([])
  const [wishlisted, setWishlisted] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getProductById(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    getAllReviews()
      .then((all) => setReviews(all.filter((r) => String(r.productId) === String(id))))
      .catch(() => {})
  }, [id])

  const refreshWishlist = useCallback(() => {
    if (!user) return
    getWishlist(user.userId)
      .then((list) => setWishlisted(list.some((w) => String(w.productId) === String(id))))
      .catch(() => {})
  }, [user, id])

  useEffect(() => {
    refreshWishlist()
  }, [refreshWishlist])

  const cartRow = useMemo(
    () => cartItems.find((c) => String(c.productId) === String(id)),
    [cartItems, id]
  )

  const avgRating = useMemo(() => {
    if (!reviews.length) return null
    return (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
  }, [reviews])

  const toggleWishlist = async () => {
    if (!user) {
      showToast('Sign in to save items to your wishlist', 'error')
      return
    }
    const has = wishlisted
    setWishlisted(!has)
    try {
      if (has) await removeFromWishlist(user.userId, product.productId)
      else await addToWishlist(user.userId, product.productId)
    } catch (err) {
      setWishlisted(has)
      showToast(err.message, 'error')
    }
  }

  const handleAdd = async () => {
    if (!user) {
      showToast('Sign in to add items to your cart', 'error')
      return
    }
    setBusy(true)
    try {
      await addItem(product.productId, 1)
      showToast(`${product.productName} added to cart`, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const changeQty = async (delta) => {
    if (!cartRow) return
    setBusy(true)
    try {
      const next = cartRow.quantity + delta
      if (next <= 0) await removeItem(cartRow.cartId)
      else await updateQuantity(cartRow.cartId, next)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <PageLoader label="Loading produce…" />

  if (notFound || !product) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <EmptyState
          icon={Sprout}
          title="We couldn't find that listing"
          subtitle="It may have sold out and been removed."
          action={<button className="btn btn-primary" onClick={() => navigate('/')}>Back to browse</button>}
        />
      </div>
    )
  }

  const outOfStock = product.status === 'Out_of_Stock' || product.stock <= 0

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 64 }}>
      <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 18 }}>
        <ArrowLeft size={15} /> Back to browse
      </Link>

      <div className="detail-grid">
        <div className="detail-media">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.productName} />
          ) : (
            <div className="product-media-fallback" style={{ height: '100%' }}>
              <Sprout size={64} strokeWidth={1.1} />
            </div>
          )}
          {product.harvestDate && (
            <div className="detail-freshness">
              <FreshnessRing harvestDate={product.harvestDate} expiryDate={product.expiryDate} size={56} />
              <div>
                <FreshnessLabel harvestDate={product.harvestDate} />
                {product.expiryDate && (
                  <div className="freshness-label">Best before {new Date(product.expiryDate).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="detail-body">
          <span className="product-origin">{categoryById.get(product.categoryId)?.categoryName || 'Farm fresh'}</span>
          <h1 className="detail-title">{product.productName}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '4px 0 6px' }}>
            {avgRating && (
              <span className="badge badge-gold">
                <Star size={12} fill="currentColor" /> {avgRating} ({reviews.length})
              </span>
            )}
            {product.countryOfOrigin && (
              <span className="freshness-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} /> {product.countryOfOrigin}
              </span>
            )}
            <span className={`badge ${outOfStock ? 'badge-neutral' : 'badge-leaf'}`}>
              {outOfStock ? 'Out of stock' : `${product.stock} ${product.unit || 'unit'} available`}
            </span>
          </div>

          <p className="detail-desc">{product.description || 'No description provided for this listing yet.'}</p>

          <div className="detail-price-row">
            <div>
              <span className="price-mono" style={{ fontSize: 26 }}>₹{Number(product.price).toFixed(2)}</span>{' '}
              <span className="price-unit">/ {product.unit || 'unit'}</span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className={`btn btn-outline btn-icon${wishlisted ? ' wishlist-active' : ''}`}
                onClick={toggleWishlist}
                aria-label="Toggle wishlist"
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} color={wishlisted ? 'var(--color-clay)' : undefined} />
              </button>

              {outOfStock ? (
                <button className="btn btn-outline" disabled>Sold out</button>
              ) : cartRow ? (
                <div className="qty-stepper" style={{ padding: '10px 16px' }}>
                  <button type="button" onClick={() => changeQty(-1)} disabled={busy}><Minus size={14} /></button>
                  <span style={{ fontSize: 15 }}>{cartRow.quantity}</span>
                  <button type="button" onClick={() => changeQty(1)} disabled={busy}><Plus size={14} /></button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={handleAdd} disabled={busy}>
                  <ShoppingBasket size={16} /> Add to cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="reviews-block">
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Buyer reviews</h2>
        {reviews.length === 0 ? (
          <p className="freshness-label">No reviews yet for this listing.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {reviews.map((r) => (
              <div key={r.reviewId} className="panel">
                <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < r.rating ? 'var(--color-wheat)' : 'none'} color="var(--color-wheat)" />
                  ))}
                </div>
                <p style={{ fontSize: 13.5 }}>{r.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
