import type { Runner, RaceResult, RacePatch } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`API Error ${res.status}: ${error}`)
  }
  return res.json()
}

export const getRunner = (id: string) =>
  fetchJSON<Runner>(`/runners/${id}`)

export const patchRace = (runnerId: string, raceId: string, updates: RacePatch) =>
  fetchJSON<RaceResult>(`/runners/${runnerId}/races/${raceId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
