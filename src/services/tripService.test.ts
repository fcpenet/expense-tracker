import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { fetchTrips, createTrip, deleteTrip } from './tripService'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const API = 'https://rag-pipeline-91ct.vercel.app'
const API_KEY = 'test-key'
const AUTH_HEADERS = { headers: { 'X-API-Key': API_KEY } }

const mockTrip = {
  id: 't1',
  title: 'Vegas Trip',
  description: null,
  start_date: null,
  end_date: null,
  participants: ['u1', 'u2'],
  created_at: '2024-01-01T00:00:00Z',
  owner_id: 'u1',
}

describe('tripService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchTrips calls GET /api/trips/ with auth header', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: [mockTrip] })

    const result = await fetchTrips(API_KEY)

    expect(mockedAxios.get).toHaveBeenCalledWith(`${API}/api/trips/`, AUTH_HEADERS)
    expect(result[0].title).toBe('Vegas Trip')
  })

  it('createTrip calls POST /api/trips/ with payload', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({ data: mockTrip })

    const payload = { title: 'Vegas Trip', participants: ['u1', 'u2'] }
    const result = await createTrip(payload, API_KEY)

    expect(mockedAxios.post).toHaveBeenCalledWith(`${API}/api/trips/`, payload, AUTH_HEADERS)
    expect(result.id).toBe('t1')
  })

  it('deleteTrip calls DELETE /api/trips/:id', async () => {
    mockedAxios.delete = vi.fn().mockResolvedValue({ data: null })

    await deleteTrip('t1', API_KEY)

    expect(mockedAxios.delete).toHaveBeenCalledWith(`${API}/api/trips/t1`, AUTH_HEADERS)
  })
})
