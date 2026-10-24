import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBasket, Truck, Wallet, CreditCard } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { useToast } from '../context/ToastContext'
import { createOrder } from '../api/orders'
import { createPayment } from '../api/payments'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/Loader'
import { Spinner } from '../components/Loader'

export default function Cart() {
  const { items, loading, updateQuantity, removeItem, clearCart, refresh } = useCart()
  const { user } = useAuth()
  const { productById } = useProducts()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [address, setAddress] = useState(() =>
    [user?.address, user?.city, user?.state, user?.country, user?.pincode].filter(Boolean).join(', ')
  )
  const [method, setMethod] = useState('COD')
  const [placing, setPlacing] = useState(false)
  const [rowBusy, setRowBusy] = useState(null)

  const rows = useMemo(
    () => items.map((c) => ({ ...c, product: productById.get(c.productId) })).filter((r) => r.product),
    [items, productById]
  )

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r.product.price) * r.quantity, 0),
    [rows]
  )
  const deliveryFee = total > 0 && total < 500 ? 40 : 0
  const grandTotal = total + deliveryFee

  const changeQty = async (row, delta) => {
    setRowBusy(row.cartId)
    try {
      const next = row.quantity + delta
      if (next <= 0) await removeItem(row.cartId)
      else await updateQuantity(row.cartId, next)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setRowBusy(null)
    }
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    if (!address.trim()) {
      showToast('Add a shipping address before placing your order', 'error')
      return
    }
    setPlacing(true)
    try {
      const order = await createOrder(user.userId, address.trim())
      await createPayment({
        orderId: order.orderId,
        paymentMethod: method,
        transactionId: `TXN-${order.orderId}-${Date.now().toString().slice(-6)}`,
        amount: order.totalAmount,
      })
      await clearCart()
      showToast('Order placed! Track it from your orders page.', 'success')
      navigate('/orders')
    } catch (err) {
      showToast(err.message, 'error')
      refresh()
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <PageLoader label="Loading your cart…" />

  if (rows.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <EmptyState
          icon={ShoppingBasket}
          title="Your cart is empty"
          subtitle="Browse the harvest and add something fresh."
          action={<button className="btn btn-primary" onClick={() => navigate('/')}>Browse produce</button>}
        />
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
      <div className="section-head">
        <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)' }}>Your cart</h1>
        <button className="btn btn-ghost btn-sm" onClick={() => clearCart().catch((e) => showToast(e.message, 'error'))}>
          <Trash2 size={14} /> Clear cart
        </button>
      </div>

      <div className="cart-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((row) => (
            <div key={row.cartId} className="cart-row">
              <div className="cart-row-media">
                {row.product.imageUrl ? (
                  <img src={row.product.imageUrl} alt={row.product.productName} />
                ) : (
                  <div className="product-media-fallback" style={{ height: '100%' }}>
                    <ShoppingBasket size={22} />
                  </div>
                )}
              </div>
              <div className="cart-row-body">
                <span className="product-name" style={{ fontSize: 15.5 }}>{row.product.productName}</span>
                <span className="price-mono" style={{ fontSize: 13.5 }}>
                  ₹{Number(row.product.price).toFixed(2)} <span className="price-unit">/ {row.product.unit || 'unit'}</span>
                </span>
              </div>
              <div className="qty-stepper">
                <button type="button" onClick={() => changeQty(row, -1)} disabled={rowBusy === row.cartId}>
                  {rowBusy === row.cartId ? <Spinner /> : <Minus size={13} />}
                </button>
                <span>{row.quantity}</span>
                <button type="button" onClick={() => changeQty(row, 1)} disabled={rowBusy === row.cartId}>
                  <Plus size={13} />
                </button>
              </div>
              <span className="price-mono cart-row-subtotal">
                ₹{(Number(row.product.price) * row.quantity).toFixed(2)}
              </span>
              <button
                type="button"
                className="btn-danger"
                onClick={() => removeItem(row.cartId).catch((e) => showToast(e.message, 'error'))}
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <form className="card checkout-card" onSubmit={placeOrder}>
          <h3 style={{ marginBottom: 16 }}>Order summary</h3>

          <div className="summary-line">
            <span>Subtotal</span>
            <span className="price-mono">₹{total.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Delivery</span>
            <span className="price-mono">{deliveryFee ? `₹${deliveryFee.toFixed(2)}` : 'Free'}</span>
          </div>
          <div className="divider" />
          <div className="summary-line summary-total">
            <span>Total</span>
            <span className="price-mono">₹{grandTotal.toFixed(2)}</span>
          </div>

          <div className="form-group" style={{ marginTop: 20 }}>
            <label className="form-label" htmlFor="shipAddr">
              <Truck size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} /> Shipping address
            </label>
            <textarea
              id="shipAddr"
              className="form-textarea"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House no, street, city, state, pincode"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment method</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <label className={`pay-option${method === 'COD' ? ' active' : ''}`}>
                <input type="radio" name="method" value="COD" checked={method === 'COD'} onChange={() => setMethod('COD')} />
                <Wallet size={15} /> Cash on delivery
              </label>
              <label className={`pay-option${method === 'CARD' ? ' active' : ''}`}>
                <input type="radio" name="method" value="CARD" checked={method === 'CARD'} onChange={() => setMethod('CARD')} />
                <CreditCard size={15} /> Card / UPI
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={placing} style={{ marginTop: 8 }}>
            {placing ? <Spinner /> : <ShoppingBasket size={16} />}
            {placing ? 'Placing order…' : `Place order · ₹${grandTotal.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  )
}
