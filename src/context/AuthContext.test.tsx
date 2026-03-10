import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'
import * as authService from '../services/authService'
import * as tokenService from '../services/tokenService'

// turso-auth's AuthProvider is just a passthrough in tests
vi.mock('turso-auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../services/authService')
vi.mock('../services/tokenService')

const mockLoginResponse = { api_key: 'key-abc', expires_at: '2099-01-01T00:00:00Z' }
const mockValidResponse = { valid: true, uses_remaining: null, expires_at: null }
const mockStoredUser = { id: 0, email: 'test@test.com', organization_id: null, role: 'member', created_at: '' }

function TestComponent() {
  const { user, apiKey, login, logout, isAuthenticated } = useAuth()
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'logged-in' : 'logged-out'}</span>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <span data-testid="key">{apiKey ?? 'none'}</span>
      <button onClick={() => login('test@test.com', 'pass').catch(() => {})}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(tokenService.validateToken).mockResolvedValue(mockValidResponse)
  })

  it('starts unauthenticated', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('auth').textContent).toBe('logged-out')
  })

  it('sets user and apiKey after login with valid token', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)
    render(<AuthProvider><TestComponent /></AuthProvider>)

    await act(async () => {
      await userEvent.click(screen.getByText('Login'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('logged-in')
      expect(screen.getByTestId('email').textContent).toBe('test@test.com')
      expect(screen.getByTestId('key').textContent).toBe('key-abc')
    })
  })

  it('validates token via /api/tokens/validate after login', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)
    render(<AuthProvider><TestComponent /></AuthProvider>)

    await act(async () => {
      await userEvent.click(screen.getByText('Login'))
    })

    expect(tokenService.validateToken).toHaveBeenCalledWith('key-abc')
  })

  it('stays logged-out when token validation returns invalid', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)
    vi.mocked(tokenService.validateToken).mockResolvedValue({
      valid: false,
      uses_remaining: 0,
      expires_at: null,
    })
    render(<AuthProvider><TestComponent /></AuthProvider>)

    await act(async () => {
      await userEvent.click(screen.getByText('Login'))
    })

    expect(screen.getByTestId('auth').textContent).toBe('logged-out')
  })

  it('persists api_key in localStorage after login', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)
    render(<AuthProvider><TestComponent /></AuthProvider>)

    await act(async () => {
      await userEvent.click(screen.getByText('Login'))
    })

    expect(localStorage.getItem('api_key')).toBe('key-abc')
  })

  it('clears state on logout', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)
    render(<AuthProvider><TestComponent /></AuthProvider>)

    await act(async () => { await userEvent.click(screen.getByText('Login')) })
    await act(async () => { await userEvent.click(screen.getByText('Logout')) })

    expect(screen.getByTestId('auth').textContent).toBe('logged-out')
    expect(localStorage.getItem('api_key')).toBeNull()
  })

  it('restores session from localStorage on mount', () => {
    localStorage.setItem('api_key', 'saved-key')
    localStorage.setItem('user', JSON.stringify(mockStoredUser))

    render(<AuthProvider><TestComponent /></AuthProvider>)

    expect(screen.getByTestId('auth').textContent).toBe('logged-in')
    expect(screen.getByTestId('key').textContent).toBe('saved-key')
  })

  it('is authenticated when api_key exists but user is missing from localStorage', () => {
    localStorage.setItem('api_key', 'orphan-key')

    render(<AuthProvider><TestComponent /></AuthProvider>)

    expect(screen.getByTestId('auth').textContent).toBe('logged-in')
  })

  it('is unauthenticated when user exists in localStorage but api_key is missing', () => {
    localStorage.setItem('user', JSON.stringify(mockStoredUser))

    render(<AuthProvider><TestComponent /></AuthProvider>)

    expect(screen.getByTestId('auth').textContent).toBe('logged-out')
  })

  it('does not crash when user JSON is corrupt, remains authenticated via api_key', () => {
    localStorage.setItem('api_key', 'some-key')
    localStorage.setItem('user', 'NOT_VALID_JSON{{')

    expect(() =>
      render(<AuthProvider><TestComponent /></AuthProvider>)
    ).not.toThrow()

    expect(screen.getByTestId('auth').textContent).toBe('logged-in')
    expect(screen.getByTestId('email').textContent).toBe('none')
  })

  it('clears state when auth:unauthorized event is fired', async () => {
    localStorage.setItem('api_key', 'some-key')
    localStorage.setItem('user', JSON.stringify(mockStoredUser))

    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('auth').textContent).toBe('logged-in')

    await act(async () => {
      window.dispatchEvent(new Event('auth:unauthorized'))
    })

    expect(screen.getByTestId('auth').textContent).toBe('logged-out')
    expect(localStorage.getItem('api_key')).toBeNull()
  })
})
