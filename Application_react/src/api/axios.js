import axios from 'axios'

// Relative baseURL — Vite's dev proxy (see vite.config.js) forwards
// every request to the Spring Boot backend at localhost:8080.
const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
})

// Surface a clean, predictable error shape everywhere in the app.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Cannot reach the server. Is the Spring Boot backend running on port 8080?'
        : error.message) ||
      'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  }
)

export default api
