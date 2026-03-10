import type { TokenValidateResponse } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? 'https://rag-pipeline-91ct.vercel.app'

export async function validateToken(token: string): Promise<TokenValidateResponse> {
  const res = await fetch(`${BASE}/api/tokens/validate/${token}`)
  if (!res.ok) {
    throw { detail: 'Failed to validate token', status: res.status }
  }
  return res.json() as Promise<TokenValidateResponse>
}
