import api from './axios'

// Backend: ShippingController -> /shipping
export const getShippingByBuyer = async (buyerId) => {
  const { data } = await api.get(`/shipping/buyer/${buyerId}`)
  return data
}

export const getAllShipping = async () => {
  const { data } = await api.get('/shipping')
  return data
}
