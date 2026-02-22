import { useState, FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useExpenses } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'
import { Header } from '../components/shared/Header'
import type { ExpenseCategory } from '../types'

const CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: 'food', label: 'Food', emoji: '🍽️' },
  { value: 'transport', label: 'Transport', emoji: '🚗' },
  { value: 'accommodation', label: 'Stay', emoji: '🏨' },
  { value: 'entertainment', label: 'Fun', emoji: '🎉' },
  { value: 'utilities', label: 'Bills', emoji: '💡' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'health', label: 'Health', emoji: '💊' },
  { value: 'other', label: 'Other', emoji: '📋' },
]

export function AddExpensePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tripId = searchParams.get('tripId') ?? undefined

  const { addExpense } = useExpenses()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('other')
  const [location, setLocation] = useState('')
  const [splitWith, setSplitWith] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!title.trim() || isNaN(amt) || amt <= 0) {
      setError('Please enter a valid title and amount.')
      return
    }

    // Build participants: current user + anyone typed in splitWith
    const extraIds = splitWith
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const allIds = [user?.id ?? '', ...extraIds].filter(Boolean)
    const share = parseFloat((1 / allIds.length).toFixed(6))
    const participants = allIds.map((id) => ({ user_id: id, share }))

    setSaving(true)
    setError('')
    try {
      await addExpense({
        title: title.trim(),
        amount: amt,
        category,
        location: location.trim() || undefined,
        payor_id: user?.id ?? '',
        participants,
        trip_id: tripId,
      })
      navigate(tripId ? `/groups/${tripId}` : '/dashboard')
    } catch (err: unknown) {
      const e = err as { detail?: string }
      setError(e?.detail ?? 'Failed to create expense.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Add Expense" backTo={tripId ? `/groups/${tripId}` : '/dashboard'} />

      <form onSubmit={handleSubmit} className="px-4 py-5 max-w-lg mx-auto space-y-5">
        {/* Amount */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Amount
          </label>
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-light text-gray-400">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-5xl font-bold text-gray-900 w-40 text-center bg-transparent focus:outline-none"
              autoFocus
              required
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
            Description
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Dinner at Nobu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-colors ${
                  category === cat.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-100 bg-white text-gray-500'
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
            Location <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="location"
            type="text"
            placeholder="e.g. New York"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Split with */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="split">
            Split with <span className="text-gray-400 font-normal">(user IDs, comma-separated)</span>
          </label>
          <input
            id="split"
            type="text"
            placeholder="user-id-1, user-id-2"
            value={splitWith}
            onChange={(e) => setSplitWith(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-gray-400 mt-1">Leave empty to split only with yourself</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-600 text-white font-semibold py-3 rounded-xl hover:bg-brand-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Add Expense'}
        </button>
      </form>
    </div>
  )
}
