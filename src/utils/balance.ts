import type { Expense, UserBalance, Balance } from '../types'

/**
 * Computes the net balance for each user across all expenses.
 * Positive net = user is owed money.
 * Negative net = user owes money.
 */
export function computeBalances(expenses: Expense[]): UserBalance[] {
  const netMap = new Map<string, number>()

  for (const expense of expenses) {
    const { amount, payor_id, participants } = expense

    // Payor gets credit for paying the full amount
    netMap.set(payor_id, (netMap.get(payor_id) ?? 0) + amount)

    // Each participant is debited their share
    for (const p of participants) {
      const owed = amount * p.share
      netMap.set(p.user_id, (netMap.get(p.user_id) ?? 0) - owed)
    }
  }

  return Array.from(netMap.entries()).map(([userId, net]) => ({ userId, net }))
}

/**
 * Given user balances, produces the minimal set of transactions to settle debts.
 */
export function simplifyDebts(balances: UserBalance[]): Balance[] {
  const creditors = balances
    .filter((b) => b.net > 0.001)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net)

  const debtors = balances
    .filter((b) => b.net < -0.001)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.net - b.net)

  const result: Balance[] = []
  let i = 0
  let j = 0

  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i]
    const debt = debtors[j]
    const amount = Math.min(credit.net, -debt.net)

    result.push({
      fromUserId: debt.userId,
      toUserId: credit.userId,
      amount: parseFloat(amount.toFixed(2)),
    })

    credit.net -= amount
    debt.net += amount

    if (credit.net < 0.001) i++
    if (debt.net > -0.001) j++
  }

  return result
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}
