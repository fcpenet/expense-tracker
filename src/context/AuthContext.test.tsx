import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'
import * as authService from '../services/authService'

vi.mock('../services/authService')

const mockLoginResponse = {
  api_key: 'key-abc',
  expires_at: '2099-01-01T00:00:00Z',
}

const mockStoredUser = { id: '', email: 'test@test.com', organization_id: null, created_at: '' }

function TestComponent() {
  const { user, apiKey, login, logout, isAuthenticated } = useAuth()
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'logged-in' : 'logged-out'}</span>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <span data-testid="key">{apiKey ?? 'none'}</span>
      <button onClick={() => login({ email: 'test@test.com', password: 'pass' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('starts unauthenticated', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('auth').textContent).toBe('logged-out')
  })

  it('sets user and apiKey after login', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)
    render(<AuthProvider><TestComponent /></AuthProvider>)

    await act(async () => {
      await userEvent.click(screen.getByText('Login'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('logged-in')
      expect(screen.getByTestId('email').textContent).toBe('test@test.com') // from credentials
      expect(screen.getByTestId('key').textContent).toBe('key-abc')
    })
  })

  it('persists apiKey in localStorage', async () => {
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

    await act(async () => {
      await userEvent.click(screen.getByText('Login'))
    })
    await act(async () => {
      await userEvent.click(screen.getByText('Logout'))
    })

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
    // no 'user' key — valid since login API does not return a user object

    render(<AuthProvider><TestComponent /></AuthProvider>)

    expect(screen.getByTestId('auth').textContent).toBe('logged-in')
  })

  it('is unauthenticated when user exists in localStorage but api_key is missing', () => {
    localStorage.setItem('user', JSON.stringify(mockStoredUser))
    // no 'api_key' key set

    render(<AuthProvider><TestComponent /></AuthProvider>)

    expect(screen.getByTestId('auth').textContent).toBe('logged-out')
  })

  it('does not crash when user in localStorage is corrupt JSON, and remains authenticated via api_key', () => {
    localStorage.setItem('api_key', 'some-key')
    localStorage.setItem('user', 'NOT_VALID_JSON{{')

    expect(() =>
      render(<AuthProvider><TestComponent /></AuthProvider>)
    ).not.toThrow()

    // api_key is still valid — user stays authenticated, just with no user data
    expect(screen.getByTestId('auth').textContent).toBe('logged-in')
    expect(screen.getByTestId('email').textContent).toBe('none')
  })
})
