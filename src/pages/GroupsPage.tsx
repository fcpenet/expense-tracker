import { useEffect, useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useExpenses } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'
import { Header } from '../components/shared/Header'
import { BottomNav } from '../components/shared/BottomNav'
import { Spinner } from '../components/shared/Spinner'
import { EmptyState } from '../components/shared/EmptyState'

export function GroupsPage() {
  const { trips, loading, loadAll, addTrip } = useExpenses()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [loadAll])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await addTrip({ title: title.trim(), participants: [user?.id ?? ''] })
      setTitle('')
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Groups"
        rightAction={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-brand-600 font-semibold text-sm"
          >
            {showForm ? 'Cancel' : '+ New'}
          </button>
        }
      />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">New Group</h3>
            <input
              type="text"
              placeholder="Group name (e.g. Vegas Trip)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Group'}
            </button>
          </form>
        )}

        {loading && <Spinner />}

        {!loading && trips.length === 0 && (
          <EmptyState
            title="No groups yet"
            subtitle="Create a group to split expenses with friends"
            action={
              <button
                onClick={() => setShowForm(true)}
                className="bg-brand-600 text-white text-sm font-semibold px-5 py-2 rounded-full"
              >
                Create Group
              </button>
            }
          />
        )}

        <div className="space-y-3">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              to={`/groups/${trip.id}`}
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-xl">
                ✈️
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{trip.title}</p>
                <p className="text-xs text-gray-400">{trip.participants.length} member{trip.participants.length !== 1 ? 's' : ''}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
