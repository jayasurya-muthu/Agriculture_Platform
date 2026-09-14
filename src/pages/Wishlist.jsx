import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBasket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { getWishlist, removeFromWishlist } from '../api/wishlist'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/Loader'

export default function Wishlist() {
  const { user } = useAuth()
  const { productById, categoryById } = useProducts()
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCart()
  const { showToast } = useToast()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const refresh = useCallback(() => {
    if (!user) return
    setLoading(true)
    getWishlist(user.userId)
      .then(setRows)
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const cartByProduct = useMemo(() => {
    const map = new Map()
    cartItems.forEach((c) => map.set(c.productId, c))
    return map
  }, [cartItems])

  const products = rows.map((r) => productById.get(r.productId)).filter(Boolean)

  const removeWish = async (product) => {
    setRows((prev) => prev.filter((r) => r.productId !== product.productId))
    try {
      await removeFromWishlist(user.userId, product.productId)
      showToast('Removed from wishlist', 'success')
    } catch (err) {
      refresh()
      showToast(err.message, 'error')
    }
  }

  const handleAdd = async (product) => {
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
    const row = cartByProduct.get(product.productId)
    if (!row) return handleAdd(product)
    setBusyId(product.productId)
    try {
      await updateQuantity(row.cartId, row.quantity + 1)
    } finally {
      setBusyId(null)
    }
  }

  const handleDecrement = async (product) => {
    const row = cartByProduct.get(product.productId)
    if (!row) return
    setBusyId(product.productId)
    try {
      row.quantity <= 1 ? await removeItem(row.cartId) : await updateQuantity(row.cartId, row.quantity - 1)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <PageLoader label="Loading your wishlist…" />

  if (products.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          subtitle="Tap the heart on any listing to save it for later."
          action={<Link to="/" className="btn btn-primary">Browse produce</Link>}
        />
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)', marginBottom: 20 }}>Your wishlist</h1>
      <div className="product-grid">
        {products.map((p) => {
          const row = cartByProduct.get(p.productId)
          return (
            <ProductCard
              key={p.productId}
              product={p}
              categoryName={categoryById.get(p.categoryId)?.categoryName}
              isWishlisted
              onToggleWishlist={removeWish}
              cartQty={row?.quantity || 0}
              onAdd={handleAdd}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              busy={busyId === p.productId}
            />
          )
        })}
      </div>
    </div>
  )
}
