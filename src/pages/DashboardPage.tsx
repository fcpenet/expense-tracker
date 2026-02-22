import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useExpenses } from '../context/ExpenseContext'
import { computeBalances, formatCurrency } from '../utils/balance'
import { ExpenseCard } from '../components/expenses/ExpenseCard'
import { Spinner } from '../components/shared/Spinner'
import { EmptyState } from '../components/shared/EmptyState'
import { BottomNav } from '../components/shared/BottomNav'

export function DashboardPage() {
  const { user } = useAuth()
  const { expenses, loading, error, loadAll, removeExpense } = useExpenses()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const balances = computeBalances(expenses)
  const myBalance = balances.find((b) => b.userId === user?.id)?.net ?? 0

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero balance card */}
      <div className="bg-brand-600 text-white px-6 pt-12 pb-8">
        <p className="text-sm opacity-80 mb-1">Welcome back, {user?.email?.split('@')[0]}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{formatCurrency(Math.abs(myBalance))}</span>
        </div>
        <p className="text-sm mt-1 opacity-90">
          {myBalance > 0.01
            ? 'total owed to you'
            : myBalance < -0.01
            ? 'total you owe'
            : 'all settled up!'}
        </p>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/add-expense"
            className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-brand-300 text-brand-700 font-semibold py-3 rounded-xl hover:bg-brand-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Expense
          </Link>
          <Link
            to="/groups"
            className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-brand-300 text-brand-700 font-semibold py-3 rounded-xl hover:bg-brand-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            New Trip
          </Link>
        </div>

        {/* Expense feed */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Recent Expenses
          </h2>

          {loading && <Spinner />}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</div>
          )}

          {!loading && !error && recentExpenses.length === 0 && (
            <EmptyState
              title="No expenses yet"
              subtitle="Add your first expense to get started"
              action={
                <Link
                  to="/add-expense"
                  className="bg-brand-600 text-white text-sm font-semibold px-5 py-2 rounded-full"
                >
                  Add Expense
                </Link>
              }
            />
          )}

          <div className="space-y-3">
            {recentExpenses.map((exp) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                currentUserId={user?.id ?? ''}
                onDelete={removeExpense}
              />
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
