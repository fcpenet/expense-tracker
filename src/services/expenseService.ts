import axios from 'axios'
import type { Expense, ExpenseCreate, ApiError } from '../types'

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

export async function fetchExpenses(apiKey: string): Promise<Expense[]> {
  try {
    const { data } = await axios.get<Expense[]>(`${BASE}/api/expenses/`, authHeaders(apiKey))
    return data
  } catch (err) {
    toApiError(err)
  }
}

export async function fetchExpensesByTrip(tripId: string, apiKey: string): Promise<Expense[]> {
  const all = await fetchExpenses(apiKey)
  return all.filter((e) => e.trip_id === tripId)
}

export async function createExpense(
  payload: Partial<ExpenseCreate>,
  apiKey: string
): Promise<Expense> {
  try {
    const { data } = await axios.post<Expense>(`${BASE}/api/expenses/`, payload, authHeaders(apiKey))
    return data
  } catch (err) {
    toApiError(err)
  }
}

export async function updateExpense(
  id: string,
  payload: Partial<ExpenseCreate>,
  apiKey: string
): Promise<Expense> {
  try {
    const { data } = await axios.patch<Expense>(`${BASE}/api/expenses/${id}`, payload, authHeaders(apiKey))
    return data
  } catch (err) {
    toApiError(err)
  }
}

export async function deleteExpense(id: string, apiKey: string): Promise<void> {
  try {
    await axios.delete(`${BASE}/api/expenses/${id}`, authHeaders(apiKey))
  } catch (err) {
    toApiError(err)
  }
}
