import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, ChevronDown, Truck, ShoppingBasket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { getOrdersByBuyer, getItemsByOrder } from '../api/orders'
import { getShippingByBuyer } from '../api/shipping'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/Loader'

const STATUS_BADGE = {
  PLACED: 'badge-gold',
  PENDING: 'badge-neutral',
  CONFIRMED: 'badge-leaf',
  SHIPPED: 'badge-leaf',
  DELIVERED: 'badge-leaf',
  CANCELLED: 'badge-clay',
  PAID: 'badge-leaf',
  FAILED: 'badge-clay',
}

export default function Orders() {
  const { user } = useAuth()
  const { productById } = useProducts()
  const [orders, setOrders] = useState([])
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [itemsByOrder, setItemsByOrder] = useState({})

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([getOrdersByBuyer(user.userId), getShippingByBuyer(user.userId).catch(() => [])])
      .then(([o, s]) => {
        setOrders(o.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)))
        setShipments(s)
      })
      .finally(() => setLoading(false))
  }, [user])

  const toggleOpen = useCallback(
    (orderId) => {
      setOpenId((prev) => (prev === orderId ? null : orderId))
      if (!itemsByOrder[orderId]) {
        getItemsByOrder(orderId)
          .then((items) => setItemsByOrder((prev) => ({ ...prev, [orderId]: items })))
          .catch(() => {})
      }
    },
    [itemsByOrder]
  )

  if (loading) return <PageLoader label="Fetching your orders…" />

  if (orders.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <EmptyState
          icon={Receipt}
          title="No orders yet"
          subtitle="Once you check out, your orders will show up here with live status."
          action={<Link to="/" className="btn btn-primary">Browse produce</Link>}
        />
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)', marginBottom: 20 }}>Your orders</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {orders.map((order) => {
          const shipment = shipments.find((s) => s.orderId === order.orderId)
          const open = openId === order.orderId
          const items = itemsByOrder[order.orderId]

          return (
            <div key={order.orderId} className="card order-card">
              <button type="button" className="order-card-head" onClick={() => toggleOpen(order.orderId)}>
                <div>
                  <span className="freshness-label">ORDER #{String(order.orderId).padStart(5, '0')}</span>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, marginTop: 2 }}>
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </div>
                </div>

                <div className="order-card-badges">
                  <span className={`badge ${STATUS_BADGE[order.orderStatus] || 'badge-neutral'}`}>{order.orderStatus}</span>
                  <span className={`badge ${STATUS_BADGE[order.paymentStatus] || 'badge-neutral'}`}>{order.paymentStatus}</span>
                  <span className="freshness-label">{new Date(order.orderDate).toLocaleDateString()}</span>
                  <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </button>

              {open && (
                <div className="order-card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {!items ? (
                      <span className="freshness-label">Loading items…</span>
                    ) : items.length === 0 ? (
                      <span className="freshness-label">No item details found for this order.</span>
                    ) : (
                      items.map((it) => {
                        const p = productById.get(it.productId)
                        return (
                          <div key={it.orderItemId} className="order-item-row">
                            <ShoppingBasket size={15} color="var(--color-leaf)" />
                            <span style={{ flex: 1 }}>{p?.productName || `Product #${it.productId}`}</span>
                            <span className="freshness-label">x{it.quantity}</span>
                            <span className="price-mono">₹{Number(it.subtotal).toFixed(2)}</span>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div className="divider" />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <span className="form-label">Shipping address</span>
                      <p style={{ fontSize: 13.5, marginTop: 4 }}>{order.shippingAddress}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <span className="form-label"><Truck size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />Shipment</span>
                      {shipment ? (
                        <p style={{ fontSize: 13.5, marginTop: 4 }}>
                          {shipment.shippingStatus || 'PENDING'}
                          {shipment.courierName ? ` · ${shipment.courierName}` : ''}
                          {shipment.trackingNumber ? ` · #${shipment.trackingNumber}` : ''}
                        </p>
                      ) : (
                        <p className="freshness-label" style={{ marginTop: 4 }}>Not yet dispatched</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
