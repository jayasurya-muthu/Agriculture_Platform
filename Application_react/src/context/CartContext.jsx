import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import {
  getCartByBuyer,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateQty,
  removeCartItem as apiRemoveItem,
  clearBuyerCart as apiClearCart,
} from '../api/cart'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const data = await getCartByBuyer(user.userId)
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      if (!user) throw new Error('Please sign in to add items to your cart')
      await apiAddToCart(user.userId, productId, quantity)
      await refresh()
    },
    [user, refresh]
  )

  const updateQuantity = useCallback(
    async (cartId, quantity) => {
      await apiUpdateQty(cartId, quantity)
      await refresh()
    },
    [refresh]
  )

  const removeItem = useCallback(
    async (cartId) => {
      await apiRemoveItem(cartId)
      await refresh()
    },
    [refresh]
  )

  const clearCart = useCallback(async () => {
    if (!user) return
    await apiClearCart(user.userId)
    setItems([])
  }, [user])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, loading, itemCount, refresh, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
