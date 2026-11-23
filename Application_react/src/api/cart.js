import api from './axios'

// Backend: CartController -> /cart
export const getCartByBuyer = async (buyerId) => {
  const { data } = await api.get(`/cart/buyer/${buyerId}`)
  return data
}

export const addToCart = async (buyerId, productId, quantity = 1) => {
  const { data } = await api.post('/cart', { buyerId, productId, quantity })
  return data
}

export const updateCartQuantity = async (cartId, quantity) => {
  const { data } = await api.put(`/cart/${cartId}`, { quantity })
  return data
}

export const removeCartItem = async (cartId) => {
  const { data } = await api.delete(`/cart/${cartId}`)
  return data
}

export const clearBuyerCart = async (buyerId) => {
  const { data } = await api.delete(`/cart/buyer/${buyerId}`)
  return data
}
