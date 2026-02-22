import { useEffect, useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useExpenses } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'
import { Header } from '../components/shared/Header'
import { BottomNav } from '../components/shared/BottomNav'
import { Spinner } from '../components/shared/Spinner'
import { EmptyState } from '../components/shared/EmptyState'

type ActiveForm = 'create' | 'join' | null

export function GroupsPage() {
  const { trips, loading, loadAll, addTrip, enterTrip } = useExpenses()
  const { user } = useAuth()

  const [activeForm, setActiveForm] = useState<ActiveForm>(null)

  // Create form state
  const [title, setTitle] = useState('')
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState('')

  // Join form state
  const [tripId, setTripId] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [joinSaving, setJoinSaving] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => { loadAll() }, [loadAll])

  function toggleForm(form: ActiveForm) {
    setActiveForm((prev) => (prev === form ? null : form))
    setCreateError('')
    setJoinError('')
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setCreateSaving(true)
    setCreateError('')
    try {
      await addTrip({ title: title.trim(), participants: [user?.id ?? ''] })
      setTitle('')
      setActiveForm(null)
    } catch (err: unknown) {
      const e = err as { detail?: string }
      setCreateError(e?.detail ?? 'Failed to create group.')
    } finally {
      setCreateSaving(false)
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    if (!tripId.trim() || !inviteCode.trim()) return
    setJoinSaving(true)
    setJoinError('')
    try {
      await enterTrip(tripId.trim(), inviteCode.trim())
      setTripId('')
      setInviteCode('')
      setActiveForm(null)
    } catch (err: unknown) {
      const e = err as { detail?: string }
      setJoinError(e?.detail ?? 'Invalid trip ID or invite code.')
    } finally {
      setJoinSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Groups"
        rightAction={
          <div className="flex gap-2">
            <button
              onClick={() => toggleForm('join')}
              className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${
                activeForm === 'join'
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-brand-600'
              }`}
            >
              Join
            </button>
            <button
              onClick={() => toggleForm('create')}
              className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${
                activeForm === 'create'
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-brand-600'
              }`}
            >
              + New
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Create form */}
        {activeForm === 'create' && (
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
            {createError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{createError}</p>
            )}
            <button
              type="submit"
              disabled={createSaving || !title.trim()}
              className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-60"
            >
              {createSaving ? 'Creating…' : 'Create Group'}
            </button>
          </form>
        )}

        {/* Join form */}
        {activeForm === 'join' && (
          <form onSubmit={handleJoin} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Join a Group</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="trip-id">
                Trip ID
              </label>
              <input
                id="trip-id"
                type="text"
                placeholder="e.g. 42"
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="invite-code">
                Invite Code
              </label>
              <input
                id="invite-code"
                type="text"
                placeholder="XXXXXXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.trim())}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-gray-400 mt-1">Ask a group member to share their invite code</p>
            </div>
            {joinError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{joinError}</p>
            )}
            <button
              type="submit"
              disabled={joinSaving || !tripId.trim() || !inviteCode.trim()}
              className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-60"
            >
              {joinSaving ? 'Joining…' : 'Join Group'}
            </button>
          </form>
        )}

        {loading && <Spinner />}

        {!loading && trips.length === 0 && (
          <EmptyState
            title="No groups yet"
            subtitle="Create a group or join one with an invite code"
            action={
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveForm('join')}
                  className="border border-brand-600 text-brand-600 text-sm font-semibold px-5 py-2 rounded-full"
                >
                  Join Group
                </button>
                <button
                  onClick={() => setActiveForm('create')}
                  className="bg-brand-600 text-white text-sm font-semibold px-5 py-2 rounded-full"
                >
                  Create Group
                </button>
              </div>
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
                <p className="text-xs text-gray-400">
                  {trip.participants?.length ?? 0} member{(trip.participants?.length ?? 0) !== 1 ? 's' : ''}
                  {trip.invite_code && (
                    <span className="ml-2 font-mono text-gray-300">{trip.invite_code}</span>
                  )}
                </p>
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
