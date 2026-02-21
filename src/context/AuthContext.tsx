import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { login as loginService, register as registerService } from '../services/authService'
import type { UserResponse, UserLogin, UserRegister } from '../types'

interface AuthState {
  user: UserResponse | null
  apiKey: string | null
  isAuthenticated: boolean
  login: (credentials: UserLogin) => Promise<void>
  register: (payload: UserRegister) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('api_key'))

  const login = useCallback(async (credentials: UserLogin) => {
    const response = await loginService(credentials)
    setUser(response.user)
    setApiKey(response.api_key)
    localStorage.setItem('api_key', response.api_key)
    localStorage.setItem('user', JSON.stringify(response.user))
  }, [])

  const register = useCallback(async (payload: UserRegister) => {
    await registerService(payload)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setApiKey(null)
    localStorage.removeItem('api_key')
    localStorage.removeItem('user')
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, apiKey, isAuthenticated: !!apiKey, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
