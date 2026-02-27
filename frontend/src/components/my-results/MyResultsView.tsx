'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import { patchRace } from '@/lib/api'
import RaceCard from './RaceCard'
import type { RaceResult, RacePatch } from '@/lib/types'

interface Props {
  initialRaces: RaceResult[]
  runnerId: string
  athleteName: string
  /** Back-link destination. Defaults to '/' — set to your app's profile URL. */
  backHref?: string
}

type FilterTab = 'all' | 'hidden'

export default function MyResultsView({ initialRaces, runnerId, athleteName, backHref = '/' }: Props) {
  const [races, setRaces] = useState<RaceResult[]>(initialRaces)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [unclaimedOnly, setUnclaimedOnly] = useState(false)
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set())

  // ── Derived state ───────────────────────────────────────────────────────
  const visible = useMemo(() => {
    return races.filter((r) => {
      if (filter === 'hidden' && !r.hidden) return false
      if (filter === 'all' && r.hidden) return false   // hide hidden from default view
      if (unclaimedOnly && r.claimed !== false) return false
      return true
    })
  }, [races, filter, unclaimedOnly])

  const byYear = useMemo(() => {
    const map = new Map<number, RaceResult[]>()
    for (const race of visible) {
      const year = race.date ? new Date(race.date).getFullYear() : 0
      if (!map.has(year)) map.set(year, [])
      map.get(year)!.push(race)
    }
    // Sort years descending
    return new Map([...map.entries()].sort((a, b) => b[0] - a[0]))
  }, [visible])

  const totalKm = useMemo(() => {
    const km = races.reduce((sum, r) => {
      if (!r.distance) return sum
      const match = r.distance.match(/([\d.]+)/)
      return sum + (match ? parseFloat(match[1]) : 0)
    }, 0)
    return km > 0 ? `${km.toLocaleString(undefined, { maximumFractionDigits: 0 })} km` : null
  }, [races])

  // ── Mutations ────────────────────────────────────────────────────────────
  async function mutate(raceId: string, patch: RacePatch) {
    const prev = races
    setRaces((r) => r.map((x) => (x.id === raceId ? { ...x, ...patch } : x)))
    setSavingIds((s) => new Set(s).add(raceId))

    try {
      const updated = await patchRace(runnerId, raceId, patch)
      setRaces((r) => r.map((x) => (x.id === raceId ? updated : x)))
    } catch {
      setRaces(prev) // rollback on error
    } finally {
      setSavingIds((s) => {
        const n = new Set(s)
        n.delete(raceId)
        return n
      })
    }
  }

  function toggleYear(year: number) {
    setCollapsedYears((prev) => {
      const next = new Set(prev)
      next.has(year) ? next.delete(year) : next.add(year)
      return next
    })
  }

  // ── Empty states ─────────────────────────────────────────────────────────
  const emptyMessages: Record<string, string> = {
    'all-false': 'No races yet.',
    'hidden-false': 'No hidden races. Use the ⋮ menu on any race to hide it.',
    'all-true': 'No unconfirmed races.',
    'hidden-true': 'No hidden unconfirmed races.',
  }
  const emptyKey = `${filter}-${unclaimedOnly}`

  return (
    <main className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Back link ──────────────────────────────────────────────── */}
        <a
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to profile
        </a>

        {/* ── Page header ────────────────────────────────────────────── */}
        <div className="flex items-baseline justify-between mb-2">
          <h1 className="text-3xl font-black text-gray-950 tracking-tight">
            My Results
          </h1>
          <div className="text-sm text-gray-400 text-right">
            <span className="font-semibold text-gray-700">{races.length}</span> races
            {totalKm && (
              <>
                {' '}·{' '}
                <span className="font-semibold text-gray-700">{totalKm}</span>
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-8">{athleteName}</p>

        {/* ── Filter bar ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
          {/* All / Hidden segmented control */}
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
            {(['all', 'hidden'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={[
                  'px-4 py-1.5 rounded-[10px] text-sm font-semibold transition-all capitalize',
                  filter === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Unclaimed toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unclaimedOnly}
              onChange={(e) => setUnclaimedOnly(e.target.checked)}
              className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
            />
            <span className="text-sm text-gray-500 font-medium">Unclaimed only</span>
          </label>

          {/* Live count */}
          <span className="ml-auto text-xs font-semibold text-gray-400">
            {visible.length} result{visible.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Race list ──────────────────────────────────────────────── */}
        {byYear.size === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            {emptyMessages[emptyKey] ?? 'No races found.'}
          </div>
        ) : (
          <div className="space-y-10">
            {[...byYear.entries()].map(([year, yearRaces]) => {
              const isCollapsed = collapsedYears.has(year)
              return (
                <section key={year}>
                  {/* Year header */}
                  <button
                    onClick={() => toggleYear(year)}
                    className="w-full flex items-center justify-between mb-4 group"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black tracking-[0.2em] text-gray-150 select-none leading-none"
                        style={{ color: '#EBEBEB' }}
                      >
                        {year === 0 ? '—' : year}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        {yearRaces.length} {yearRaces.length === 1 ? 'race' : 'races'}
                      </span>
                    </div>
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    )}
                  </button>

                  <div className="h-px bg-gray-100 mb-4" />

                  {!isCollapsed && (
                    <div className="space-y-3">
                      {yearRaces.map((race) => (
                        <RaceCard
                          key={race.id}
                          race={race}
                          isSaving={savingIds.has(race.id)}
                          onSave={mutate}
                          isEditing={editingId === race.id}
                          onOpenEdit={() => setEditingId(race.id)}
                          onCloseEdit={() => setEditingId(null)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
