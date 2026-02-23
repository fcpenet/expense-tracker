// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserRegister {
  email: string
  password: string
  organization_id?: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface UserResponse {
  id: string
  email: string
  organization_id: string | null
  created_at: string
}

export interface LoginResponse {
  api_key: string
  expires_at: string
}

// ─── Trips (Groups) ──────────────────────────────────────────────────────────

export interface TripCreate {
  title: string
  description?: string
  start_date?: string
  end_date?: string
  participants?: string[]  // user IDs — omit to let the API add the creator automatically
}

export interface Trip {
  id: string
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  participants: string[]
  invite_code: string | null
  created_at: string
  updated_at: string
  owner_id: string
}

export interface JoinTripRequest {
  invite_code: string
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'utilities'
  | 'shopping'
  | 'health'
  | 'other'

export interface Participant {
  user_id: string
  share: number             // decimal, e.g. 0.5 for 50%
}

export interface ExpenseCreate {
  title: string
  amount: number
  tag?: string
  category?: ExpenseCategory
  location?: string
  description?: string
  payor_id: string          // who paid
  participants: Participant[]
  trip_id?: string
}

export interface Expense {
  id: string
  title: string
  amount: number
  tag: string | null
  category: ExpenseCategory | null
  location: string | null
  description: string | null
  payor_id: string
  participants: Participant[]
  trip_id: string | null
  created_at: string
  owner_id: string
}

// ─── Balances (computed client-side) ─────────────────────────────────────────

export interface Balance {
  fromUserId: string
  toUserId: string
  amount: number
}

export interface UserBalance {
  userId: string
  net: number   // positive = owed money, negative = owes money
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string
  status?: number
}
