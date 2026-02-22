import { useEffect } from 'react'
import { useExpenses } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'
import { computeBalances, simplifyDebts, formatCurrency } from '../utils/balance'
import { Header } from '../components/shared/Header'
import { BottomNav } from '../components/shared/BottomNav'
import { Spinner } from '../components/shared/Spinner'

export function SettleUpPage() {
  const { expenses, loading, loadAll } = useExpenses()
  const { user } = useAuth()

  useEffect(() => { loadAll() }, [loadAll])

  const balances = computeBalances(expenses)
  const debts = simplifyDebts(balances)
  const myDebts = debts.filter(
    (d) => d.fromUserId === user?.id || d.toUserId === user?.id
  )
  const othersDebts = debts.filter(
    (d) => d.fromUserId !== user?.id && d.toUserId !== user?.id
  )

  const myNet = balances.find((b) => b.userId === user?.id)?.net ?? 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Settle Up" />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
        {/* Net summary */}
        <div
          className={`rounded-2xl p-5 text-center ${
            myNet > 0.01
              ? 'bg-green-50 border border-green-100'
              : myNet < -0.01
              ? 'bg-orange-50 border border-orange-100'
              : 'bg-gray-100'
          }`}
        >
          <p className="text-sm font-medium text-gray-500 mb-1">Your net balance</p>
          <p
            className={`text-3xl font-bold ${
              myNet > 0.01 ? 'text-green-600' : myNet < -0.01 ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            {myNet > 0.01 ? '+' : ''}{formatCurrency(myNet)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {myNet > 0.01
              ? 'Others owe you this amount'
              : myNet < -0.01
              ? 'You owe this amount in total'
              : 'You\'re all settled up!'}
          </p>
        </div>

        {loading && <Spinner />}

        {/* Your debts */}
        {myDebts.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Your Settlements
            </h2>
            <div className="space-y-2">
              {myDebts.map((d, i) => {
                const isOwing = d.fromUserId === user?.id
                return (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {isOwing ? `Pay ${d.toUserId.slice(0, 12)}…` : `${d.fromUserId.slice(0, 12)}… pays you`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isOwing ? 'You owe' : 'Owed to you'}
                      </p>
                    </div>
                    <span
                      className={`text-base font-bold ${isOwing ? 'text-orange-600' : 'text-green-600'}`}
                    >
                      {formatCurrency(d.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* All settlements */}
        {othersDebts.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              All Settlements
            </h2>
            <div className="space-y-2">
              {othersDebts.map((d, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
                >
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{d.fromUserId.slice(0, 10)}…</span>
                    {' → '}
                    <span className="font-medium">{d.toUserId.slice(0, 10)}…</span>
                  </p>
                  <span className="text-sm font-bold text-gray-800">{formatCurrency(d.amount)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && debts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-semibold text-gray-700">All settled up!</p>
            <p className="text-sm text-gray-400 mt-1">No outstanding balances</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
