import api from './axios'

// Backend: AdminController / AdminDashboardController
export const getAllUsers = async () => {
  const { data } = await api.get('/admin/users')
  return data
}

export const getDashboardStatistics = async () => {
  const { data } = await api.get('/admin/dashboard/statistics')
  return data
}
