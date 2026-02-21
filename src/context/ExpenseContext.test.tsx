import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseProvider, useExpenses } from './ExpenseContext'
import * as expenseService from '../services/expenseService'
import * as tripService from '../services/tripService'

vi.mock('../services/expenseService')
vi.mock('../services/tripService')
vi.mock('./AuthContext', () => ({
  useAuth: () => ({ apiKey: 'test-key', user: { id: 'u1' } }),
}))

const mockExpense = {
  id: 'e1', title: 'Dinner', amount: 60, tag: null, category: 'food',
  location: null, description: null, payor_id: 'u1',
  participants: [{ user_id: 'u1', share: 0.5 }, { user_id: 'u2', share: 0.5 }],
  trip_id: null, created_at: '2024-01-01T00:00:00Z', owner_id: 'u1',
}

const mockTrip = {
  id: 't1', title: 'Vegas', description: null, start_date: null,
  end_date: null, participants: ['u1', 'u2'], created_at: '', owner_id: 'u1',
}

function TestComponent() {
  const { expenses, trips, loading, error, loadAll } = useExpenses()
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'idle'}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <span data-testid="count">{expenses.length}</span>
      <span data-testid="trips">{trips.length}</span>
      <button onClick={loadAll}>Load</button>
    </div>
  )
}

describe('ExpenseContext', () => {
  beforeEach(() => vi.clearAllMocks())

  it('starts with empty state', () => {
    vi.mocked(expenseService.fetchExpenses).mockResolvedValue([])
    vi.mocked(tripService.fetchTrips).mockResolvedValue([])
    render(<ExpenseProvider><TestComponent /></ExpenseProvider>)
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('loads expenses and trips on loadAll', async () => {
    vi.mocked(expenseService.fetchExpenses).mockResolvedValue([mockExpense])
    vi.mocked(tripService.fetchTrips).mockResolvedValue([mockTrip])

    render(<ExpenseProvider><TestComponent /></ExpenseProvider>)

    await act(async () => {
      await userEvent.click(screen.getByText('Load'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1')
      expect(screen.getByTestId('trips').textContent).toBe('1')
    })
  })

  it('shows error when fetch fails', async () => {
    vi.mocked(expenseService.fetchExpenses).mockRejectedValue({ detail: 'Unauthorized' })
    vi.mocked(tripService.fetchTrips).mockResolvedValue([])

    render(<ExpenseProvider><TestComponent /></ExpenseProvider>)

    await act(async () => {
      await userEvent.click(screen.getByText('Load'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Unauthorized')
    })
  })
})
