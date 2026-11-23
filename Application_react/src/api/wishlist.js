import api from './axios'

// Backend: WishlistController -> /api/wishlist
export const getWishlist = async (buyerId) => {
  const { data } = await api.get(`/api/wishlist/buyer/${buyerId}`)
  return data
}

export const addToWishlist = async (buyerId, productId) => {
  const { data } = await api.post('/api/wishlist', { buyerId, productId })
  return data
}

export const removeFromWishlist = async (buyerId, productId) => {
  const { data } = await api.delete(`/api/wishlist/buyer/${buyerId}/product/${productId}`)
  return data
}
