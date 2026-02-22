import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { login, register } from './authService'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const API = 'https://rag-pipeline-91ct.vercel.app'

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('sends POST to /api/users/login with credentials', async () => {
      const mockResponse = {
        data: {
          api_key: 'test-key-123',
          expires_at: '2025-12-31T00:00:00Z',
          user: { id: 'u1', email: 'test@test.com', organization_id: null, created_at: '' },
        },
      }
      mockedAxios.post = vi.fn().mockResolvedValue(mockResponse)

      const result = await login({ email: 'test@test.com', password: 'secret' })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API}/api/users/login`,
        { email: 'test@test.com', password: 'secret' }
      )
      expect(result.api_key).toBe('test-key-123')
    })

    it('throws an ApiError when credentials are wrong', async () => {
      mockedAxios.post = vi.fn().mockRejectedValue({
        response: { data: { detail: 'Invalid credentials' }, status: 401 },
      })

      await expect(login({ email: 'bad@test.com', password: 'wrong' })).rejects.toMatchObject({
        detail: 'Invalid credentials',
        status: 401,
      })
    })
  })

  describe('register', () => {
    it('sends POST to /api/users/register with email and password only', async () => {
      const mockResponse = {
        data: { id: 'u2', email: 'new@test.com', organization_id: null, created_at: '' },
      }
      mockedAxios.post = vi.fn().mockResolvedValue(mockResponse)

      const result = await register({ email: 'new@test.com', password: 'pass123' })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API}/api/users/register`,
        { email: 'new@test.com', password: 'pass123' }
      )
      expect(result.email).toBe('new@test.com')
    })
  })
})
