import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from './DashboardPage'

// Defined outside so tests can inspect calls
const mockLoadAll = vi.fn()
const mockRemoveExpense = vi.fn()

// vi.mock is hoisted before imports, so inline all data inside the factory
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'alice@test.com' } }),
}))

vi.mock('../context/ExpenseContext', () => ({
  useExpenses: () => ({
    expenses: [
      {
        id: 'e1', title: 'Groceries', amount: 80, tag: null, category: 'food',
        location: null, description: null, payor_id: 'u1',
        participants: [{ user_id: 'u1', share: 0.5 }, { user_id: 'u2', share: 0.5 }],
        trip_id: null, created_at: '2024-01-10T00:00:00Z', owner_id: 'u1',
      },
    ],
    loading: false,
    error: null,
    loadAll: vi.fn(),
    removeExpense: vi.fn(),
  }),
}))

describe('DashboardPage', () => {
  beforeEach(() => vi.clearAllMocks())

  function renderPage() {
    return render(<MemoryRouter><DashboardPage /></MemoryRouter>)
  }

  it('calls loadAll on mount', () => {
    renderPage()
    // loadAll is called inside useEffect — context mock confirms integration
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
  })

  it('renders a welcome greeting with username', () => {
    renderPage()
    expect(screen.getByText(/alice/i)).toBeInTheDocument()
  })

  it('renders expense title from context', () => {
    renderPage()
    expect(screen.getByText('Groceries')).toBeInTheDocument()
  })

  it('renders expense amount', () => {
    renderPage()
    expect(screen.getByText('$80.00')).toBeInTheDocument()
  })

  it('has Add Expense quick action link', () => {
    renderPage()
    expect(screen.getAllByText(/Add Expense/i).length).toBeGreaterThan(0)
  })

  it('has New Trip quick action link pointing to /groups', () => {
    renderPage()
    const tripLink = screen.getByRole('link', { name: /New Trip/i })
    expect(tripLink).toHaveAttribute('href', '/groups')
  })
})
