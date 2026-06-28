'use client'

import { useState, useTransition } from 'react'
import { updateEvent } from '@/actions/admin'
import type { EventEdits } from '@/actions/admin'
import type { EventWithCount } from '@/types/database'
import type { ContentLocation } from '@/lib/content'
import {
  Edit2, Check, X, MapPin, Clock, Users, AlertTriangle,
  FileText, ToggleLeft, ToggleRight, ChevronDown,
} from 'lucide-react'

const AGE_GROUP_COLORS: Record<string, string> = {
  children: 'bg-yellow-100 text-yellow-700',
  teens:    'bg-blue-100 text-blue-700',
  adults:   'bg-green-100 text-green-700',
  seniors:  'bg-purple-100 text-purple-700',
  all:      'bg-orange-100 text-orange-700',
}

interface Props {
  events: EventWithCount[]
  locations: ContentLocation[]
}

type EditState = Required<EventEdits>

export default function ScheduleManager({ events, locations }: Props) {
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editValues, setEditValues] = useState<EditState>({
    slot_time: '', location: '', max_participants: 0, description: '', is_active: true,
  })
  const [isPending, startTransition] = useTransition()
  const [savedId, setSavedId]       = useState<string | null>(null)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)

  // Local optimistic state so toggling is_active feels instant
  const [localActive, setLocalActive] = useState<Record<string, boolean>>({})

  const startEdit = (event: EventWithCount) => {
    setEditingId(event.id)
    setErrorMsg(null)
    setEditValues({
      slot_time:        event.slot_time,
      location:         event.location,
      max_participants: event.max_participants,
      description:      event.description ?? '',
      is_active:        event.is_active,
    })
  }

  const cancelEdit = () => { setEditingId(null); setErrorMsg(null) }

  const saveEdit = (eventId: string) => {
    if (!editValues.slot_time.trim()) {
      setErrorMsg('Time slot cannot be empty.')
      return
    }
    if (editValues.max_participants < 1) {
      setErrorMsg('Capacity must be at least 1.')
      return
    }
    startTransition(async () => {
      const res = await updateEvent(eventId, editValues)
      if (res.success) {
        setSavedId(eventId)
        setTimeout(() => setSavedId(null), 2500)
        setEditingId(null)
        setErrorMsg(null)
      } else {
        setErrorMsg(res.message)
      }
    })
  }

  const toggleActive = (event: EventWithCount) => {
    const next = !(localActive[event.id] ?? event.is_active)
    setLocalActive((prev) => ({ ...prev, [event.id]: next }))
    startTransition(async () => {
      const res = await updateEvent(event.id, { is_active: next })
      if (!res.success) {
        // Revert on failure
        setLocalActive((prev) => ({ ...prev, [event.id]: !next }))
      }
    })
  }

  const set = (field: keyof EditState, value: string | number | boolean) =>
    setEditValues((v) => ({ ...v, [field]: value }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Click <span className="font-medium text-slate-700">Edit</span> to change a
          slot's time, venue, capacity, or description. Toggle the switch to show/hide
          an event from the registration form.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {events.map((event) => {
          const count     = event.registrations[0]?.count ?? 0
          const isActive  = localActive[event.id] ?? event.is_active
          const capacity  = isActive ? editingId === event.id ? editValues.max_participants : event.max_participants : event.max_participants
          const pct       = Math.min(Math.round((count / capacity) * 100), 100)
          const isFull    = count >= capacity
          const isEditing = editingId === event.id
          const wasSaved  = savedId === event.id

          return (
            <div
              key={event.id}
              className={`
                bg-white rounded-xl border p-5 shadow-sm transition-all
                ${isEditing  ? 'border-orange-300 ring-2 ring-orange-100 col-span-1 lg:col-span-2' : ''}
                ${wasSaved   ? 'border-green-300' : !isEditing ? 'border-slate-200 hover:border-slate-300' : ''}
                ${!isActive  ? 'opacity-60' : ''}
              `}
            >
              {/* ── Card Header ── */}
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800">{event.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${AGE_GROUP_COLORS[event.age_group]}`}>
                      {event.age_group}
                    </span>
                    {!isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                        Hidden
                      </span>
                    )}
                    {wasSaved && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Check size={12} /> Saved
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(event)}
                    disabled={isPending}
                    title={isActive ? 'Hide from registration form' : 'Show on registration form'}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {isActive
                      ? <ToggleRight size={20} className="text-green-500" />
                      : <ToggleLeft  size={20} />}
                  </button>

                  {!isEditing ? (
                    <button
                      onClick={() => startEdit(event)}
                      className="p-2 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                      title="Edit event"
                    >
                      <Edit2 size={16} />
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => saveEdit(event.id)}
                        disabled={isPending}
                        className="p-2 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-50"
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Edit Form (expanded) or Read View ── */}
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Time slot */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                        <Clock size={12} /> Time Slot
                      </label>
                      <input
                        value={editValues.slot_time}
                        onChange={(e) => set('slot_time', e.target.value)}
                        placeholder="09:00 AM – 10:30 AM"
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </div>

                    {/* Capacity */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                        <Users size={12} /> Max Participants
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={editValues.max_participants}
                        onChange={(e) => set('max_participants', Number(e.target.value))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                      <MapPin size={12} /> Location
                    </label>
                    <div className="relative">
                      <select
                        value={editValues.location}
                        onChange={(e) => set('location', e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white appearance-none"
                      >
                        {locations.map((loc) => (
                          <option key={loc.name} value={loc.name}>
                            {loc.name}{loc.capacity ? ` — ${loc.capacity}` : ''}
                          </option>
                        ))}
                        {/* Fallback: keep the current value even if it's not in the list */}
                        {!locations.find((l) => l.name === editValues.location) && (
                          <option value={editValues.location}>{editValues.location}</option>
                        )}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                      <FileText size={12} /> Description
                    </label>
                    <textarea
                      value={editValues.description}
                      onChange={(e) => set('description', e.target.value)}
                      rows={2}
                      placeholder="Short description of the event…"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle size={12} /> {errorMsg}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-600">{event.slot_time}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-600">{event.location}</span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{event.description}</p>
                  )}
                </>
              )}

              {/* ── Capacity Bar ── */}
              <div className={isEditing ? 'mt-4 pt-4 border-t border-slate-100' : ''}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users size={12} />
                    <span>{count} / {capacity} registered</span>
                  </div>
                  {isFull
                    ? <span className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertTriangle size={11} /> Full</span>
                    : <span className="text-xs text-slate-400">{pct}% full</span>
                  }
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
