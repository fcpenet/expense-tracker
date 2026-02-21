import { describe, it, expect } from 'vitest'
import { computeBalances, simplifyDebts } from './balance'
import type { Expense } from '../types'

const makeExpense = (overrides: Partial<Expense>): Expense => ({
  id: 'e1',
  title: 'Test',
  amount: 100,
  tag: null,
  category: null,
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
  ...overrides,
})

describe('computeBalances', () => {
  it('returns empty array for no expenses', () => {
    expect(computeBalances([])).toEqual([])
  })

  it('u1 paid $100 split evenly: u2 owes u1 $50', () => {
    const expenses = [makeExpense({})]
    const balances = computeBalances(expenses)

    const u1 = balances.find((b) => b.userId === 'u1')
    const u2 = balances.find((b) => b.userId === 'u2')

    expect(u1?.net).toBeCloseTo(50)   // u1 is owed $50
    expect(u2?.net).toBeCloseTo(-50)  // u2 owes $50
  })

  it('handles three-way split', () => {
    const expenses = [
      makeExpense({
        amount: 90,
        participants: [
          { user_id: 'u1', share: 1 / 3 },
          { user_id: 'u2', share: 1 / 3 },
          { user_id: 'u3', share: 1 / 3 },
        ],
      }),
    ]
    const balances = computeBalances(expenses)
    const u1 = balances.find((b) => b.userId === 'u1')
    const u2 = balances.find((b) => b.userId === 'u2')
    const u3 = balances.find((b) => b.userId === 'u3')

    expect(u1?.net).toBeCloseTo(60)
    expect(u2?.net).toBeCloseTo(-30)
    expect(u3?.net).toBeCloseTo(-30)
  })

  it('net is zero when everyone has paid equally', () => {
    const expenses = [
      makeExpense({ payor_id: 'u1', amount: 100 }),
      makeExpense({ id: 'e2', payor_id: 'u2', amount: 100 }),
    ]
    const balances = computeBalances(expenses)
    for (const b of balances) {
      expect(b.net).toBeCloseTo(0)
    }
  })
})

describe('simplifyDebts', () => {
  it('returns minimal transactions', () => {
    const balances = [
      { userId: 'u1', net: 50 },
      { userId: 'u2', net: -50 },
    ]
    const debts = simplifyDebts(balances)
    expect(debts).toHaveLength(1)
    expect(debts[0]).toMatchObject({ fromUserId: 'u2', toUserId: 'u1', amount: 50 })
  })

  it('handles multiple creditors and debtors', () => {
    const balances = [
      { userId: 'u1', net: 30 },
      { userId: 'u2', net: 20 },
      { userId: 'u3', net: -50 },
    ]
    const debts = simplifyDebts(balances)
    const total = debts.reduce((s, d) => s + d.amount, 0)
    expect(total).toBeCloseTo(50)
  })
})
