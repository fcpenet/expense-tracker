import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useExpenses } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'
import { computeBalances, simplifyDebts, formatCurrency } from '../utils/balance'
import { ExpenseCard } from '../components/expenses/ExpenseCard'
import { Header } from '../components/shared/Header'
import { BottomNav } from '../components/shared/BottomNav'
import { Spinner } from '../components/shared/Spinner'
import { EmptyState } from '../components/shared/EmptyState'

export function GroupDetailPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { user } = useAuth()
  const { expenses, trips, loading, loadAll, removeExpense } = useExpenses()

  useEffect(() => { loadAll() }, [loadAll])

  const trip = trips.find((t) => t.id === tripId)
  const tripExpenses = expenses.filter((e) => e.trip_id === tripId)
  const balances = computeBalances(tripExpenses)
  const debts = simplifyDebts(balances)
  const myDebts = debts.filter((d) => d.fromUserId === user?.id || d.toUserId === user?.id)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title={trip?.title ?? 'Group'}
        backTo="/groups"
        rightAction={
          <Link
            to={`/add-expense?tripId=${tripId}`}
            className="text-brand-600 font-semibold text-sm"
          >
            + Add
          </Link>
        }
      />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-5">
        {/* Balance summary */}
        {myDebts.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Your Balances
            </h2>
            <div className="space-y-2">
              {myDebts.map((d, i) => {
                const isOwing = d.fromUserId === user?.id
                return (
                  <div
                    key={i}
                    className={`rounded-xl px-4 py-3 text-sm font-medium ${
                      isOwing ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {isOwing
                      ? `You owe ${d.toUserId.slice(0, 8)}… ${formatCurrency(d.amount)}`
                      : `${d.fromUserId.slice(0, 8)}… owes you ${formatCurrency(d.amount)}`}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Expense list */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Expenses · {formatCurrency(tripExpenses.reduce((s, e) => s + e.amount, 0))} total
          </h2>

          {loading && <Spinner />}

          {!loading && tripExpenses.length === 0 && (
            <EmptyState
              title="No expenses in this group"
              subtitle="Add the first expense for this group"
              action={
                <Link
                  to={`/add-expense?tripId=${tripId}`}
                  className="bg-brand-600 text-white text-sm font-semibold px-5 py-2 rounded-full"
                >
                  Add Expense
                </Link>
              }
            />
          )}

          <div className="space-y-3">
            {tripExpenses
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((exp) => (
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
