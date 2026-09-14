import { useEffect, useState, useCallback } from 'react'
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../api/notifications'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/Loader'

export default function Notifications() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!user) return
    setLoading(true)
    getNotifications(user.userId)
      .then((list) => setNotifications(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleRead = async (n) => {
    setNotifications((prev) => prev.map((x) => (x.notificationId === n.notificationId ? { ...x, read: true } : x)))
    try {
      await markAsRead(n.notificationId)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleReadAll = async () => {
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })))
    try {
      await markAllAsRead(user.userId)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (n) => {
    setNotifications((prev) => prev.filter((x) => x.notificationId !== n.notificationId))
    try {
      await deleteNotification(n.notificationId)
    } catch (err) {
      refresh()
      showToast(err.message, 'error')
    }
  }

  if (loading) return <PageLoader label="Checking for updates…" />

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 64, maxWidth: 720 }}>
      <div className="section-head">
        <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)' }}>Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button className="btn btn-ghost btn-sm" onClick={handleReadAll}>
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" subtitle="Order and account updates will show up here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((n) => (
            <div key={n.notificationId} className={`panel notification-row${n.read ? '' : ' unread'}`}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!n.read && <span className="freshness-dot" style={{ background: 'var(--color-clay)' }} />}
                  <strong style={{ fontSize: 14 }}>{n.title}</strong>
                  {n.notificationType && <span className="badge badge-neutral">{n.notificationType}</span>}
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--color-ink-soft)', marginTop: 4 }}>{n.message}</p>
                <span className="freshness-label">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {!n.read && (
                  <button className="btn btn-icon btn-outline" onClick={() => handleRead(n)} aria-label="Mark as read">
                    <Check size={15} />
                  </button>
                )}
                <button className="btn-danger" onClick={() => handleDelete(n)} aria-label="Delete notification">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
