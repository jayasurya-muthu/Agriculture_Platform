import api from './axios'

// Backend: AuthController -> POST /api/auth/register, POST /api/auth/login
// Every new signup is created with role "BUYER" server-side (see AuthService).
// There is no token issued (Spring Security permits all requests), so the
// frontend keeps the returned user object in localStorage to stay "signed in".

export const registerUser = async (payload) => {
  const { data } = await api.post('/api/auth/register', payload)
  return data
}

export const loginUser = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password })
  return data
}
