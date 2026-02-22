import { useAuth } from '../context/AuthContext'
import { useExpenses } from '../context/ExpenseContext'
import { Header } from '../components/shared/Header'
import { BottomNav } from '../components/shared/BottomNav'
import { computeBalances } from '../utils/balance'

export function AccountPage() {
  const { user, logout } = useAuth()
  const { expenses } = useExpenses()

  const balances = computeBalances(expenses)
  const myNet = balances.find((b) => b.userId === user?.id)?.net ?? 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Account" />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
              {user?.email?.[0].toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">ID: {user?.id?.slice(0, 16)}…</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total Expenses</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className={`text-2xl font-bold ${myNet >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {myNet >= 0 ? '+' : ''}{myNet.toFixed(0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Net Balance</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="w-full bg-white border border-red-200 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
