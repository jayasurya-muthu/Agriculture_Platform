import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Backend (Spring Boot) runs on http://localhost:8080.
// The API layer in src/api/*.js calls relative paths like '/api/products'
// or '/cart' — this proxy forwards all of them to the real backend so the
// browser never hits a cross-origin request in dev (sidesteps CORS entirely).
const BACKEND = 'http://localhost:8080'
const BACKEND_PATHS = [
  '/api',
  '/cart',
  '/orders',
  '/order-items',
  '/categories',
  '/reviews',
  '/admin',
  '/payments',
  '/shipping',
  '/users',
  '/contact-messages',
  '/farmer-certificates',
  '/inventory',
]

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      BACKEND_PATHS.map((p) => [p, { target: BACKEND, changeOrigin: true }])
    ),
  },
})
