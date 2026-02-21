import axios from 'axios'
import type { LoginResponse, UserLogin, UserRegister, UserResponse, ApiError } from '../types'

const BASE = 'https://rag-pipeline-91ct.vercel.app'

function toApiError(err: unknown): never {
  const e = err as { response?: { data?: { detail?: string }; status?: number } }
  const detail = e?.response?.data?.detail ?? 'An error occurred'
  const status = e?.response?.status
  throw { detail, status } satisfies ApiError
}

export async function login(credentials: UserLogin): Promise<LoginResponse> {
  try {
    const { data } = await axios.post<LoginResponse>(`${BASE}/api/users/login`, credentials)
    return data
  } catch (err) {
    toApiError(err)
  }
}

export async function register(payload: UserRegister): Promise<UserResponse> {
  try {
    const { data } = await axios.post<UserResponse>(`${BASE}/api/users/register`, payload)
    return data
  } catch (err) {
    toApiError(err)
  }
}
