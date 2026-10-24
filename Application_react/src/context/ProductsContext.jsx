import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { getAllProducts } from '../api/products'
import { getAllCategories } from '../api/categories'

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [productData, categoryData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ])
      setProducts(productData)
      setCategories(categoryData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const productById = useMemo(() => {
    const map = new Map()
    products.forEach((p) => map.set(p.productId, p))
    return map
  }, [products])

  const categoryById = useMemo(() => {
    const map = new Map()
    categories.forEach((c) => map.set(c.categoryId, c))
    return map
  }, [categories])

  return (
    <ProductsContext.Provider
      value={{ products, categories, loading, error, refresh, productById, categoryById }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => useContext(ProductsContext)
