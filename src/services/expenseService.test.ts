import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from './expenseService'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const API = 'https://rag-pipeline-91ct.vercel.app'
const API_KEY = 'test-key'
const AUTH_HEADERS = { headers: { 'X-API-Key': API_KEY } }

const mockExpense = {
  id: 'e1',
  title: 'Dinner',
  amount: 60,
  tag: null,
  category: 'food',
  location: null,
  description: null,
  payor_id: 'u1',
  participants: [
    { user_id: 'u1', share: 0.5 },
    { user_id: 'u2', share: 0.5 },
  ],
  trip_id: null,
  created_at: '2024-01-01T00:00:00Z',
  owner_id: 'u1',
}

describe('expenseService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchExpenses calls GET /api/expenses/ with auth header', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: [mockExpense] })

    const result = await fetchExpenses(API_KEY)

    expect(mockedAxios.get).toHaveBeenCalledWith(`${API}/api/expenses/`, AUTH_HEADERS)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Dinner')
  })

  it('createExpense calls POST /api/expenses/ with body and auth', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({ data: mockExpense })

    const payload = {
      title: 'Dinner',
      amount: 60,
      payor_id: 'u1',
      participants: [{ user_id: 'u1', share: 0.5 }, { user_id: 'u2', share: 0.5 }],
    }
    const result = await createExpense(payload, API_KEY)

    expect(mockedAxios.post).toHaveBeenCalledWith(`${API}/api/expenses/`, payload, AUTH_HEADERS)
    expect(result.id).toBe('e1')
  })

  it('updateExpense calls PATCH /api/expenses/:id with body and auth', async () => {
    const updated = { ...mockExpense, title: 'Late Dinner' }
    mockedAxios.patch = vi.fn().mockResolvedValue({ data: updated })

    const result = await updateExpense('e1', { title: 'Late Dinner' }, API_KEY)

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      `${API}/api/expenses/e1`,
      { title: 'Late Dinner' },
      AUTH_HEADERS
    )
    expect(result.title).toBe('Late Dinner')
  })

  it('deleteExpense calls DELETE /api/expenses/:id with auth', async () => {
    mockedAxios.delete = vi.fn().mockResolvedValue({ data: null })

    await deleteExpense('e1', API_KEY)

    expect(mockedAxios.delete).toHaveBeenCalledWith(`${API}/api/expenses/e1`, AUTH_HEADERS)
  })

  it('fetchExpenses throws ApiError on failure', async () => {
    mockedAxios.get = vi.fn().mockRejectedValue({
      response: { data: { detail: 'Unauthorized' }, status: 401 },
    })

    await expect(fetchExpenses(API_KEY)).rejects.toMatchObject({ detail: 'Unauthorized', status: 401 })
  })
})
