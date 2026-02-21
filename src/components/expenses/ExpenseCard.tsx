import { formatCurrency } from '../../utils/balance'
import type { Expense } from '../../types'

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍽️',
  transport: '🚗',
  accommodation: '🏨',
  entertainment: '🎉',
  utilities: '💡',
  shopping: '🛍️',
  health: '💊',
  other: '📋',
}

interface Props {
  expense: Expense
  currentUserId: string
  onDelete?: (id: string) => void
}

export function ExpenseCard({ expense, currentUserId, onDelete }: Props) {
  const emoji = expense.category ? (CATEGORY_EMOJI[expense.category] ?? '📋') : '📋'
  const isPayer = expense.payor_id === currentUserId
  const myShare = expense.participants.find((p) => p.user_id === currentUserId)?.share ?? 0
  const myAmount = expense.amount * myShare

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-3">
      <div className="text-2xl mt-0.5">{emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 truncate">{expense.title}</p>
          <p className="font-bold text-gray-900 shrink-0">{formatCurrency(expense.amount)}</p>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(expense.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
          {expense.location ? ` · ${expense.location}` : ''}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isPayer
                ? 'bg-green-50 text-green-700'
                : 'bg-orange-50 text-orange-700'
            }`}
          >
            {isPayer ? `You lent ${formatCurrency(expense.amount - myAmount)}` : `You owe ${formatCurrency(myAmount)}`}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(expense.id)}
              className="text-gray-300 hover:text-red-500 transition-colors p-1"
              aria-label="Delete expense"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
