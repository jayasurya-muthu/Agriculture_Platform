import api from './axios'

// Backend: PaymentController -> /payments
export const createPayment = async ({ orderId, paymentMethod, transactionId, amount }) => {
  const { data } = await api.post('/payments', { orderId, paymentMethod, transactionId, amount })
  return data
}
