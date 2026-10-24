import api from './axios'

// Backend: ProductController -> /api/products (public browse/read)
export const getAllProducts = async () => {
  const { data } = await api.get('/api/products')
  return data
}

export const getProductById = async (id) => {
  const { data } = await api.get(`/api/products/${id}`)
  return data
}

// Backend: AdminProductController -> /admin/products (farmer/admin management)
export const createProduct = async (product) => {
  const { data } = await api.post('/admin/products', product)
  return data
}

export const updateProduct = async (id, product) => {
  const { data } = await api.put(`/admin/products/${id}`, product)
  return data
}

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/admin/products/${id}`)
  return data
}

export const updateProductStock = async (id, stock) => {
  const { data } = await api.put(`/api/products/${id}/stock`, { stock })
  return data
}
