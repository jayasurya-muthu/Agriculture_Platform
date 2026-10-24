import { useEffect, useState, useCallback } from 'react'
import {
  LayoutDashboard, Users, Package, Receipt, Plus, Trash2, Pencil, X,
  ShoppingBasket, Wallet, TrendingUp, AlertTriangle,
} from 'lucide-react'
import { useProducts } from '../../context/ProductsContext'
import { useToast } from '../../context/ToastContext'
import { getDashboardStatistics, getAllUsers } from '../../api/admin'
import { getAllOrders } from '../../api/orders'
import { createProduct, updateProduct, deleteProduct } from '../../api/products'
import PageLoader from '../../components/Loader'
import { Spinner } from '../../components/Loader'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: Receipt },
  { id: 'users', label: 'Users', icon: Users },
]

const EMPTY_PRODUCT = {
  productName: '',
  description: '',
  price: '',
  stock: '',
  unit: '',
  imageUrl: '',
  countryOfOrigin: '',
  categoryId: '',
  harvestDate: '',
  expiryDate: '',
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)', marginBottom: 4 }}>Admin dashboard</h1>
      <p className="freshness-label" style={{ marginBottom: 20 }}>Manage listings, orders, and buyers across the marketplace.</p>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'orders' && <OrdersTab />}
      {tab === 'users' && <UsersTab />}
    </div>
  )
}

function OverviewTab() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getDashboardStatistics().then(setStats).catch(() => setStats({}))
  }, [])

  if (!stats) return <PageLoader label="Loading statistics…" />

  const cards = [
    { label: 'Total users', value: stats.totalUsers ?? stats.userCount ?? '—', icon: Users },
    { label: 'Total products', value: stats.totalProducts ?? stats.productCount ?? '—', icon: Package },
    { label: 'Total orders', value: stats.totalOrders ?? stats.orderCount ?? '—', icon: Receipt },
    { label: 'Revenue', value: stats.totalRevenue ? `₹${stats.totalRevenue}` : (stats.revenue ? `₹${stats.revenue}` : '—'), icon: TrendingUp },
  ]

  return (
    <div className="stat-grid">
      {cards.map((c) => (
        <div key={c.label} className="card stat-card">
          <c.icon size={20} color="var(--color-leaf)" />
          <div className="price-mono stat-value">{c.value}</div>
          <span className="freshness-label">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

function ProductsTab() {
  const { products, categories, categoryById, refresh } = useProducts()
  const { showToast } = useToast()
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_PRODUCT)

  const openNew = () => {
    setForm(EMPTY_PRODUCT)
    setEditing('new')
  }
  const openEdit = (p) => {
    setForm({
      productName: p.productName || '',
      description: p.description || '',
      price: p.price ?? '',
      stock: p.stock ?? '',
      unit: p.unit || '',
      imageUrl: p.imageUrl || '',
      countryOfOrigin: p.countryOfOrigin || '',
      categoryId: p.categoryId ?? '',
      harvestDate: p.harvestDate || '',
      expiryDate: p.expiryDate || '',
    })
    setEditing(p)
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      harvestDate: form.harvestDate || null,
      expiryDate: form.expiryDate || null,
    }
    try {
      if (editing === 'new') {
        await createProduct(payload)
        showToast('Product added', 'success')
      } else {
        await updateProduct(editing.productId, payload)
        showToast('Product updated', 'success')
      }
      setEditing(null)
      refresh()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p) => {
    try {
      await deleteProduct(p.productId)
      showToast('Product deleted', 'success')
      refresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div>
      <div className="section-head">
        <h2 style={{ fontSize: 18 }}>Listings ({products.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <Plus size={14} /> Add product
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId}>
                <td>{p.productName}</td>
                <td>{categoryById.get(p.categoryId)?.categoryName || '—'}</td>
                <td className="price-mono">₹{Number(p.price).toFixed(2)}</td>
                <td>{p.stock}</td>
                <td><span className={`badge ${p.status === 'Available' ? 'badge-leaf' : 'badge-neutral'}`}>{p.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-icon btn-outline" onClick={() => openEdit(p)} aria-label="Edit"><Pencil size={14} /></button>
                    <button className="btn-danger" onClick={() => remove(p)} aria-label="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <div className="section-head" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 17 }}>{editing === 'new' ? 'Add product' : 'Edit product'}</h3>
              <button type="button" className="btn btn-icon btn-ghost" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Product name</label>
              <input className="form-input" required value={form.productName} onChange={update('productName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={update('description')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input type="number" step="0.01" min="0" className="form-input" required value={form.price} onChange={update('price')} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input type="number" min="0" className="form-input" required value={form.stock} onChange={update('stock')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input className="form-input" placeholder="kg, dozen, bunch…" value={form.unit} onChange={update('unit')} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.categoryId} onChange={update('categoryId')}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" value={form.imageUrl} onChange={update('imageUrl')} placeholder="https://…" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Country of origin</label>
                <input className="form-input" value={form.countryOfOrigin} onChange={update('countryOfOrigin')} />
              </div>
              <div className="form-group">
                <label className="form-label">Harvest date</label>
                <input type="date" className="form-input" value={form.harvestDate} onChange={update('harvestDate')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry date</label>
              <input type="date" className="form-input" value={form.expiryDate} onChange={update('expiryDate')} />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              {saving ? <Spinner /> : <Plus size={15} />}
              {saving ? 'Saving…' : editing === 'new' ? 'Add product' : 'Save changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    getAllOrders().then(setOrders).catch(() => setOrders([]))
  }, [])

  if (!orders) return <PageLoader label="Loading orders…" />
  if (orders.length === 0) return <p className="freshness-label">No orders placed yet.</p>

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr><th>Order</th><th>Buyer</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th></tr>
        </thead>
        <tbody>
          {orders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .map((o) => (
              <tr key={o.orderId}>
                <td className="price-mono">#{String(o.orderId).padStart(5, '0')}</td>
                <td>Buyer #{o.buyerId}</td>
                <td className="price-mono">₹{Number(o.totalAmount).toFixed(2)}</td>
                <td><span className="badge badge-gold">{o.orderStatus}</span></td>
                <td><span className="badge badge-leaf">{o.paymentStatus}</span></td>
                <td className="freshness-label">{new Date(o.orderDate).toLocaleDateString()}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState(null)

  useEffect(() => {
    getAllUsers().then(setUsers).catch(() => setUsers([]))
  }, [])

  if (!users) return <PageLoader label="Loading users…" />

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>City</th><th>Country</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-clay' : 'badge-neutral'}`}>{u.role}</span></td>
              <td>{u.city || '—'}</td>
              <td>{u.country || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
