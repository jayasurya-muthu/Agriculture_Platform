import api from './axios'

// Backend: NotificationController -> /api/notifications
export const getNotifications = async (userId) => {
  const { data } = await api.get(`/api/notifications/user/${userId}`)
  return data
}

export const getUnreadCount = async (userId) => {
  const { data } = await api.get(`/api/notifications/user/${userId}/count`)
  return data
}

export const markAsRead = async (notificationId) => {
  const { data } = await api.put(`/api/notifications/${notificationId}/read`)
  return data
}

export const markAllAsRead = async (userId) => {
  const { data } = await api.put(`/api/notifications/user/${userId}/read-all`)
  return data
}

export const deleteNotification = async (notificationId) => {
  const { data } = await api.delete(`/api/notifications/${notificationId}`)
  return data
}
