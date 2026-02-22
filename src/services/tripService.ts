import axios from 'axios'
import type { Trip, TripCreate, ApiError } from '../types'

const BASE = 'https://rag-pipeline-91ct.vercel.app'

function authHeaders(apiKey: string) {
  return { headers: { 'X-API-Key': apiKey } }
}

function toApiError(err: unknown): never {
  const e = err as { response?: { data?: { detail?: string }; status?: number } }
  throw {
    detail: e?.response?.data?.detail ?? 'An error occurred',
    status: e?.response?.status,
  } satisfies ApiError
}

export async function fetchTrips(apiKey: string): Promise<Trip[]> {
  try {
    const { data } = await axios.get<Trip[]>(`${BASE}/api/trips/`, authHeaders(apiKey))
    return data
  } catch (err) {
    toApiError(err)
  }
}

export async function createTrip(payload: Partial<TripCreate>, apiKey: string): Promise<Trip> {
  try {
    const { data } = await axios.post<Trip>(`${BASE}/api/trips/`, payload, authHeaders(apiKey))
    return data
  } catch (err) {
    toApiError(err)
  }
}

export async function updateTrip(
  id: string,
  payload: Partial<TripCreate>,
  apiKey: string
): Promise<Trip> {
  try {
    const { data } = await axios.patch<Trip>(`${BASE}/api/trips/${id}`, payload, authHeaders(apiKey))
    return data
  } catch (err) {
    toApiError(err)
  }
}

export async function deleteTrip(id: string, apiKey: string): Promise<void> {
  try {
    await axios.delete(`${BASE}/api/trips/${id}`, authHeaders(apiKey))
  } catch (err) {
    toApiError(err)
  }
}

export async function joinTrip(id: string, invite_code: string, apiKey: string): Promise<Trip> {
  try {
    const { data } = await axios.post<Trip>(
      `${BASE}/api/trips/${id}/join`,
      { invite_code },
      authHeaders(apiKey)
    )
    return data
  } catch (err) {
    toApiError(err)
  }
}
