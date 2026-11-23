import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { loginUser, registerUser } from '../api/auth'

const AuthContext = createContext(null)
const STORAGE_KEY = 'ga_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const login = useCallback(async (email, password) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await loginUser(email, password)
      const loggedIn = {
        userId: res.userId,
        fullName: res.fullName,
        email: res.email,
        role: res.role,
      }
      setUser(loggedIn)
      return loggedIn
    } catch (err) {
      setAuthError(err.message)
      throw err
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const signup = useCallback(async (payload) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await registerUser(payload)
      return res
    } catch (err) {
      setAuthError(err.message)
      throw err
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, authError, authLoading, setAuthError }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
