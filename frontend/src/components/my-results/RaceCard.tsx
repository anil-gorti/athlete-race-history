'use client'

import { useState, useRef, useEffect } from 'react'
import {
  MoreHorizontal,
  Pencil,
  Eye,
  EyeOff,
  Flag,
  ExternalLink,
  Loader2,
  X,
  Check,
} from 'lucide-react'
import type { RaceResult, RacePatch } from '@/lib/types'

interface Props {
  race: RaceResult
  isSaving: boolean
  onSave: (raceId: string, patch: RacePatch) => Promise<void>
  isEditing: boolean
  onOpenEdit: () => void
  onCloseEdit: () => void
}

export default function RaceCard({
  race,
  isSaving,
  onSave,
  isEditing,
  onOpenEdit,
  onCloseEdit,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showUnclaimConfirm, setShowUnclaimConfirm] = useState(false)
  const [editFinishTime, setEditFinishTime] = useState(race.finish_time ?? '')
  const [editTimingLink, setEditTimingLink] = useState(race.timing_link ?? '')
  const menuRef = useRef<HTMLDivElement>(null)

  const isPB =
    race.category_rank === 1 || race.overall_rank === 1
  const isUnclaimed = race.claimed === false

  // Sync edit fields when race prop changes (after save)
  useEffect(() => {
    setEditFinishTime(race.finish_time ?? '')
    setEditTimingLink(race.timing_link ?? '')
  }, [race.finish_time, race.timing_link])

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function handleMenuAction(action: 'edit' | 'hide' | 'unclaim') {
    setMenuOpen(false)
    if (action === 'edit') {
      onOpenEdit()
    } else if (action === 'hide') {
      onSave(race.id, { hidden: !race.hidden })
    } else if (action === 'unclaim') {
      setShowUnclaimConfirm(true)
    }
  }

  async function handleSaveEdit() {
    await onSave(race.id, {
      finish_time: editFinishTime || null,
      timing_link: editTimingLink || null,
    })
    onCloseEdit()
  }

  // ── Card style based on state ─────────────────────────────────────────────
  const cardBase = 'rounded-2xl bg-white border shadow-sm transition-all duration-200'
  const cardStyle = isPB
    ? `${cardBase} border-t-4 border-t-amber-400 border-x-gray-100 border-b-gray-100`
    : isUnclaimed
    ? `${cardBase} border border-amber-200`
    : `${cardBase} border-gray-100`

  const cardOpacity = race.hidden ? 'opacity-40' : ''

  // ── Unclaim confirmation overlay ──────────────────────────────────────────
  if (showUnclaimConfirm) {
    return (
      <div className={`${cardBase} border-gray-100 p-5`}>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Remove this race from your profile?
        </p>
        <p className="text-xs text-gray-500 mb-4">
          You can contact us to restore it later.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowUnclaimConfirm(false)
              onSave(race.id, { claimed: false })
            }}
            className="flex-1 py-2 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Yes, remove it
          </button>
          <button
            onClick={() => setShowUnclaimConfirm(false)}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Keep it
          </button>
        </div>
      </div>
    )
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className={`${cardBase} border-orange-200 p-5`}>
        {/* Race identity — not editable */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-0.5">{formatDate(race.date)}</p>
          <p className="font-bold text-gray-900">{race.event_name}</p>
          {race.distance && (
            <p className="text-xs text-gray-400 mt-0.5">{race.distance}</p>
          )}
        </div>

        {/* Editable fields */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Finish time
            </label>
            <input
              type="text"
              value={editFinishTime}
              onChange={(e) => setEditFinishTime(e.target.value)}
              placeholder="H:MM:SS"
              className="w-full border-b-2 border-gray-200 focus:border-orange-500 outline-none text-sm text-gray-900 pb-1.5 bg-transparent transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Official results link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={editTimingLink}
                onChange={(e) => setEditTimingLink(e.target.value)}
                placeholder="https://results.timingsystem.com/..."
                className="flex-1 border-b-2 border-gray-200 focus:border-orange-500 outline-none text-sm text-gray-900 pb-1.5 bg-transparent transition-colors"
              />
              {editTimingLink && (
                <a
                  href={editTimingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-500 transition-colors shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveEdit}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Save changes
          </button>
          <button
            onClick={onCloseEdit}
            disabled={isSaving}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Display mode ──────────────────────────────────────────────────────────
  return (
    <div className={`${cardStyle} ${cardOpacity} p-5`}>
      {/* Top row: chips + menu */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isPB && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
              ★ Personal Best
            </span>
          )}
          {race.hidden && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">
              Hidden
            </span>
          )}
          {isUnclaimed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
              Unconfirmed
            </span>
          )}
        </div>

        {/* ⋮ menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            disabled={isSaving}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
            aria-label="Race options"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreHorizontal className="w-4 h-4" />
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
              <MenuOption
                icon={<Pencil className="w-3.5 h-3.5" />}
                label="Edit time or link"
                onClick={() => handleMenuAction('edit')}
              />
              <MenuOption
                icon={
                  race.hidden ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )
                }
                label={race.hidden ? 'Show on profile' : 'Hide from profile'}
                onClick={() => handleMenuAction('hide')}
              />
              <MenuOption
                icon={<Flag className="w-3.5 h-3.5" />}
                label="Not my race"
                onClick={() => handleMenuAction('unclaim')}
                disabled={isUnclaimed}
                danger
              />
            </div>
          )}
        </div>
      </div>

      {/* Race info */}
      <p className="text-xs text-gray-400 mb-0.5">{formatDate(race.date)}</p>
      <p className="text-lg font-bold text-gray-950 leading-snug mb-1">
        {race.event_name}
      </p>
      <p className="text-xs text-gray-400">
        {[race.notes, race.distance].filter(Boolean).join(' · ')}
      </p>

      {/* Bottom row: timing link + finish time */}
      <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-50">
        <div>
          {race.timing_link ? (
            <a
              href={race.timing_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors"
            >
              Official Results
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span /> // empty — intentional, no "—" placeholder
          )}
        </div>
        {race.finish_time && (
          <span className="text-2xl font-black text-gray-950 tabular-nums leading-none">
            {race.finish_time}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function MenuOption({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left',
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-50',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  )
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
