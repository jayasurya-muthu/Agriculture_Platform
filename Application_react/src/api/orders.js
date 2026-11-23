import api from './axios'

// Backend: OrdersController -> /orders
export const createOrder = async (buyerId, shippingAddress) => {
  const { data } = await api.post('/orders', { buyerId, shippingAddress })
  return data
}

export const getOrdersByBuyer = async (buyerId) => {
  const { data } = await api.get(`/orders/buyer/${buyerId}`)
  return data
}

export const getAllOrders = async () => {
  const { data } = await api.get('/orders')
  return data
}

// Backend: OrderItemController -> /order-items
export const getItemsByOrder = async (orderId) => {
  const { data } = await api.get(`/order-items/order/${orderId}`)
  return data
}
