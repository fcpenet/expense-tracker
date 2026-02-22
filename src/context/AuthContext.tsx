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

function loadStoredSession(): { user: UserResponse | null; apiKey: string | null } {
  const apiKey = localStorage.getItem('api_key')
  const stored = localStorage.getItem('user')

  if (!apiKey || !stored) {
    // Partial state — clear both to stay consistent
    localStorage.removeItem('api_key')
    localStorage.removeItem('user')
    return { user: null, apiKey: null }
  }

  try {
    const user = JSON.parse(stored) as UserResponse
    return { user, apiKey }
  } catch {
    // Corrupt JSON — clear and start fresh
    localStorage.removeItem('api_key')
    localStorage.removeItem('user')
    return { user: null, apiKey: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => loadStoredSession().user)
  const [apiKey, setApiKey] = useState<string | null>(() => loadStoredSession().apiKey)

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
      value={{ user, apiKey, isAuthenticated: !!apiKey && !!user, login, register, logout }}
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
