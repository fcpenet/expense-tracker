import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../services/expenseService'
import { fetchTrips, createTrip, deleteTrip, joinTrip } from '../services/tripService'
import { useAuth } from './AuthContext'
import type { Expense, ExpenseCreate, Trip, TripCreate } from '../types'

interface ExpenseState {
  expenses: Expense[]
  trips: Trip[]
  loading: boolean
  error: string | null
  loadAll: () => Promise<void>
  addExpense: (payload: Partial<ExpenseCreate>) => Promise<void>
  editExpense: (id: string, payload: Partial<ExpenseCreate>) => Promise<void>
  removeExpense: (id: string) => Promise<void>
  addTrip: (payload: Partial<TripCreate>) => Promise<void>
  enterTrip: (tripId: string, inviteCode: string) => Promise<void>
  removeTrip: (id: string) => Promise<void>
}

const ExpenseContext = createContext<ExpenseState | null>(null)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { apiKey } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    if (!apiKey) return
    setLoading(true)
    setError(null)
    try {
      const [exp, trp] = await Promise.all([fetchExpenses(apiKey), fetchTrips(apiKey)])
      setExpenses(exp)
      setTrips(trp)
    } catch (err: unknown) {
      const e = err as { detail?: string }
      setError(e?.detail ?? 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  const addExpense = useCallback(
    async (payload: Partial<ExpenseCreate>) => {
      if (!apiKey) return
      const expense = await createExpense(payload, apiKey)
      setExpenses((prev) => [expense, ...prev])
    },
    [apiKey]
  )

  const editExpense = useCallback(
    async (id: string, payload: Partial<ExpenseCreate>) => {
      if (!apiKey) return
      const updated = await updateExpense(id, payload, apiKey)
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
    },
    [apiKey]
  )

  const removeExpense = useCallback(
    async (id: string) => {
      if (!apiKey) return
      await deleteExpense(id, apiKey)
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    },
    [apiKey]
  )

  const addTrip = useCallback(
    async (payload: Partial<TripCreate>) => {
      if (!apiKey) return
      const trip = await createTrip(payload, apiKey)
      setTrips((prev) => [trip, ...prev])
    },
    [apiKey]
  )

  const enterTrip = useCallback(
    async (tripId: string, inviteCode: string) => {
      if (!apiKey) return
      const trip = await joinTrip(tripId, inviteCode, apiKey)
      setTrips((prev) =>
        prev.find((t) => t.id === trip.id) ? prev : [trip, ...prev]
      )
    },
    [apiKey]
  )

  const removeTrip = useCallback(
    async (id: string) => {
      if (!apiKey) return
      await deleteTrip(id, apiKey)
      setTrips((prev) => prev.filter((t) => t.id !== id))
    },
    [apiKey]
  )

  return (
    <ExpenseContext.Provider
      value={{ expenses, trips, loading, error, loadAll, addExpense, editExpense, removeExpense, addTrip, enterTrip, removeTrip }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenses(): ExpenseState {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpenses must be used inside ExpenseProvider')
  return ctx
}
