import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Carrot, Apple, Wheat, Flame, Sprout, Leaf, Grid3x3, PackageSearch } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/Loader'

const CATEGORY_ICONS = {
  vegetables: Carrot,
  fruits: Apple,
  grains: Wheat,
  pulses: Sprout,
  spices: Flame,
  seeds: Sprout,
  'organic products': Leaf,
}

function iconFor(name) {
  return CATEGORY_ICONS[(name || '').toLowerCase()] || Grid3x3
}

export default function Home() {
  const { products, categories, categoryById, loading, error } = useProducts()
  const { user } = useAuth()
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCart()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || ''
  const query = (searchParams.get('q') || '').toLowerCase()

  const [wishlistIds, setWishlistIds] = useState(new Set())
  const [busyId, setBusyId] = useState(null)

  const refreshWishlist = useCallback(() => {
    if (!user) {
      setWishlistIds(new Set())
      return
    }
    getWishlist(user.userId)
      .then((list) => setWishlistIds(new Set(list.map((w) => w.productId))))
      .catch(() => {})
  }, [user])

  useEffect(() => {
    refreshWishlist()
  }, [refreshWishlist])

  const cartByProduct = useMemo(() => {
    const map = new Map()
    cartItems.forEach((c) => map.set(c.productId, c))
    return map
  }, [cartItems])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && String(p.categoryId) !== activeCategory) return false
      if (query && !p.productName?.toLowerCase().includes(query)) return false
      return true
    })
  }, [products, activeCategory, query])

  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('category', id)
    else next.delete('category')
    setSearchParams(next)
  }

  const toggleWishlist = async (product) => {
    if (!user) {
      showToast('Sign in to save items to your wishlist', 'error')
      return
    }
    const has = wishlistIds.has(product.productId)
    setWishlistIds((prev) => {
      const next = new Set(prev)
      has ? next.delete(product.productId) : next.add(product.productId)
      return next
    })
    try {
      if (has) await removeFromWishlist(user.userId, product.productId)
      else await addToWishlist(user.userId, product.productId)
    } catch (err) {
      refreshWishlist()
      showToast(err.message, 'error')
    }
  }

  const handleAdd = async (product) => {
    if (!user) {
      showToast('Sign in to add items to your cart', 'error')
      return
    }
    setBusyId(product.productId)
    try {
      await addItem(product.productId, 1)
      showToast(`${product.productName} added to cart`, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleIncrement = async (product) => {
    const cartRow = cartByProduct.get(product.productId)
    if (!cartRow) return handleAdd(product)
    setBusyId(product.productId)
    try {
      await updateQuantity(cartRow.cartId, cartRow.quantity + 1)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleDecrement = async (product) => {
    const cartRow = cartByProduct.get(product.productId)
    if (!cartRow) return
    setBusyId(product.productId)
    try {
      if (cartRow.quantity <= 1) await removeItem(cartRow.cartId)
      else await updateQuantity(cartRow.cartId, cartRow.quantity - 1)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <PageLoader label="Loading today's harvest…" />

  return (
    <div className="app-main">
      <section className="hero-band">
        <div className="container hero-band-inner">
          <span className="eyebrow">Today&rsquo;s harvest</span>
          <h1>Fresh off the field, on your doorstep.</h1>
          <p>
            Every listing shows exactly when it was picked — order early for the freshest ring on
            the card.
          </p>
          <div className="freshness-legend">
            <span className="freshness-legend-item">
              <span className="freshness-dot" style={{ background: 'var(--color-leaf)' }} /> Just picked
            </span>
            <span className="freshness-legend-item">
              <span className="freshness-dot" style={{ background: 'var(--color-wheat-deep)' }} /> A few days old
            </span>
            <span className="freshness-legend-item">
              <span className="freshness-dot" style={{ background: 'var(--color-clay)' }} /> Use soon
            </span>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="category-rail" role="tablist" aria-label="Filter by category">
          <button
            type="button"
            className={`category-chip${!activeCategory ? ' active' : ''}`}
            onClick={() => setCategory('')}
          >
            <span className="chip-icon"><Grid3x3 size={15} /></span>
            All produce
          </button>
          {categories.map((c) => {
            const Icon = iconFor(c.categoryName)
            const id = String(c.categoryId)
            return (
              <button
                key={c.categoryId}
                type="button"
                className={`category-chip${activeCategory === id ? ' active' : ''}`}
                onClick={() => setCategory(id)}
              >
                <span className="chip-icon"><Icon size={15} /></span>
                {c.categoryName}
              </button>
            )
          })}
        </div>

        <div className="section-head" style={{ marginTop: 8 }}>
          <h2>{activeCategory ? categoryById.get(Number(activeCategory))?.categoryName || 'Produce' : 'All produce'}</h2>
          <span className="freshness-label">{filtered.length} item{filtered.length === 1 ? '' : 's'}</span>
        </div>

        {error && <div className="form-error">{error}</div>}

        {filtered.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Nothing matches yet"
            subtitle="Try a different category or search term."
          />
        ) : (
          <div className="product-grid" style={{ paddingBottom: 64 }}>
            {filtered.map((p) => {
              const cartRow = cartByProduct.get(p.productId)
              return (
                <ProductCard
                  key={p.productId}
                  product={p}
                  categoryName={categoryById.get(p.categoryId)?.categoryName}
                  isWishlisted={wishlistIds.has(p.productId)}
                  onToggleWishlist={toggleWishlist}
                  cartQty={cartRow?.quantity || 0}
                  onAdd={handleAdd}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  busy={busyId === p.productId}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
