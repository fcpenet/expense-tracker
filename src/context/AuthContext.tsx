import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { AuthProvider as TursoAuthProvider } from 'turso-auth'
import { login as loginService, register as registerService } from '../services/authService'
import { validateToken } from '../services/tokenService'
import type { UserResponse, UserRegister } from '../types'

interface AuthState {
  user: UserResponse | null
  apiKey: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: UserRegister) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function loadStoredSession(): { user: UserResponse | null; apiKey: string | null } {
  const apiKey = localStorage.getItem('api_key')
  if (!apiKey) return { user: null, apiKey: null }

  const stored = localStorage.getItem('user')
  if (!stored) return { user: null, apiKey }

  try {
    const user = JSON.parse(stored) as UserResponse
    return { user, apiKey }
  } catch {
    localStorage.removeItem('user')
    return { user: null, apiKey }
  }
}

function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => loadStoredSession().user)
  const [apiKey, setApiKey] = useState<string | null>(() => loadStoredSession().apiKey)

  // Listen for auth:unauthorized dispatched by notifyUnauthorized() in services
  useEffect(() => {
    const handler = () => {
      setUser(null)
      setApiKey(null)
      localStorage.removeItem('api_key')
      localStorage.removeItem('user')
    }
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginService({ email, password })

    // Validate token via GET /api/tokens/validate/{token}
    const validation = await validateToken(response.api_key)
    if (!validation.valid) {
      throw { detail: 'Token is invalid or has expired' }
    }

    const sessionUser: UserResponse = {
      id: 0,
      email,
      organization_id: null,
      role: 'member',
      created_at: '',
    }
    setUser(sessionUser)
    setApiKey(response.api_key)
    localStorage.setItem('api_key', response.api_key)
    localStorage.setItem('user', JSON.stringify(sessionUser))
  }, [])

  const register = useCallback(
    async (payload: UserRegister) => {
      await registerService(payload)
      await login(payload.email, payload.password)
    },
    [login]
  )

  const logout = useCallback(() => {
    setUser(null)
    setApiKey(null)
    localStorage.removeItem('api_key')
    localStorage.removeItem('user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, apiKey, isAuthenticated: !!apiKey, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <TursoAuthProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </TursoAuthProvider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
