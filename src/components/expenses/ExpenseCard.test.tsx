import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseCard } from './ExpenseCard'
import type { Expense } from '../../types'

const mockExpense: Expense = {
  id: 'e1',
  title: 'Pizza Night',
  amount: 40,
  tag: null,
  category: 'food',
  location: 'NYC',
  description: null,
  payor_id: 'u1',
  participants: [
    { user_id: 'u1', share: 0.5 },
    { user_id: 'u2', share: 0.5 },
  ],
  trip_id: null,
  created_at: '2024-03-15T00:00:00Z',
  owner_id: 'u1',
}

describe('ExpenseCard', () => {
  it('renders title and amount', () => {
    render(<ExpenseCard expense={mockExpense} currentUserId="u1" />)
    expect(screen.getByText('Pizza Night')).toBeInTheDocument()
    expect(screen.getByText('$40.00')).toBeInTheDocument()
  })

  it('shows "You lent" label when current user is payer', () => {
    render(<ExpenseCard expense={mockExpense} currentUserId="u1" />)
    expect(screen.getByText(/You lent/)).toBeInTheDocument()
  })

  it('shows "You owe" label when current user is not payer', () => {
    render(<ExpenseCard expense={mockExpense} currentUserId="u2" />)
    expect(screen.getByText(/You owe/)).toBeInTheDocument()
  })

  it('shows location in subtitle', () => {
    render(<ExpenseCard expense={mockExpense} currentUserId="u1" />)
    expect(screen.getByText(/NYC/)).toBeInTheDocument()
  })

  it('calls onDelete with expense id when delete button clicked', async () => {
    const onDelete = vi.fn()
    render(<ExpenseCard expense={mockExpense} currentUserId="u1" onDelete={onDelete} />)
    await userEvent.click(screen.getByLabelText('Delete expense'))
    expect(onDelete).toHaveBeenCalledWith('e1')
  })

  it('does not render delete button when onDelete not provided', () => {
    render(<ExpenseCard expense={mockExpense} currentUserId="u1" />)
    expect(screen.queryByLabelText('Delete expense')).not.toBeInTheDocument()
  })
})
