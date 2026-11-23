import api from './axios'

// Backend only exposes GET /reviews (ReviewController has no create endpoint
// yet), so reviews are shown read-only for now.
export const getAllReviews = async () => {
  const { data } = await api.get('/reviews')
  return data
}
