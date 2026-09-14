import api from './axios'

// Backend: CategoryController -> GET /categories
export const getAllCategories = async () => {
  const { data } = await api.get('/categories')
  return data
}
