'use client'

import { useState, useTransition } from 'react'
import { updateEvent, createEvent, deleteEvent } from '@/actions/admin'
import type { EventEdits } from '@/actions/admin'
import type { EventWithCount } from '@/types/database'
import type { ContentLocation } from '@/lib/content'
import {
  Edit2, Check, X, MapPin, Clock, Users, AlertTriangle,
  FileText, ToggleLeft, ToggleRight, ChevronDown, Plus, Info, Trash2,
} from 'lucide-react'

const AGE_GROUPS = ['children', 'teens', 'adults', 'seniors', 'all'] as const
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

const BLANK_NEW = {
  name: '', age_group: 'all', event_date: '', slot_time: '', location: '',
  max_participants: 30, description: '',
}

export default function ScheduleManager({ events, locations }: Props) {
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editValues, setEditValues] = useState<EditState>({
    event_date: '', slot_time: '', location: '', max_participants: 0, description: '', is_active: true,
  })
  const [isPending, startTransition] = useTransition()
  const [savedId, setSavedId]       = useState<string | null>(null)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)
  const [localActive, setLocalActive] = useState<Record<string, boolean>>({})

  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ ...BLANK_NEW })
  const [addError, setAddError]   = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState(false)

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // ── Edit existing ──────────────────────────────────────────────────────────
  const startEdit = (event: EventWithCount) => {
    setEditingId(event.id)
    setErrorMsg(null)
    setEditValues({
      event_date:       event.event_date ?? '',
      slot_time:        event.slot_time,
      location:         event.location,
      max_participants: event.max_participants,
      description:      event.description ?? '',
      is_active:        event.is_active,
    })
  }
  const cancelEdit = () => { setEditingId(null); setErrorMsg(null) }

  const saveEdit = (eventId: string) => {
    if (!editValues.slot_time.trim()) { setErrorMsg('Time slot cannot be empty.'); return }
    if (editValues.max_participants < 1) { setErrorMsg('Capacity must be at least 1.'); return }
    startTransition(async () => {
      const res = await updateEvent(eventId, editValues)
      if (res.success) {
        setSavedId(eventId); setTimeout(() => setSavedId(null), 2500)
        setEditingId(null); setErrorMsg(null)
      } else {
        setErrorMsg(res.message)
      }
    })
  }

  const toggleActive = (event: EventWithCount) => {
    const next = !(localActive[event.id] ?? event.is_active)
    setLocalActive(p => ({ ...p, [event.id]: next }))
    startTransition(async () => {
      const res = await updateEvent(event.id, { is_active: next })
      if (!res.success) setLocalActive(p => ({ ...p, [event.id]: !next }))
    })
  }

  const set = (field: keyof EditState, value: string | number | boolean) =>
    setEditValues(v => ({ ...v, [field]: value }))

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = (eventId: string) => {
    setDeleteError(null)
    startTransition(async () => {
      const res = await deleteEvent(eventId)
      if (res.success) {
        setConfirmDeleteId(null)
      } else {
        setDeleteError(res.message)
        setConfirmDeleteId(null)
      }
    })
  }

  // ── Add new event ──────────────────────────────────────────────────────────
  const setNew = (field: keyof typeof BLANK_NEW, value: string | number) =>
    setNewEvent(v => ({ ...v, [field]: value }))

  const submitNew = () => {
    if (!newEvent.name.trim())      { setAddError('Event name is required.'); return }
    if (!newEvent.event_date)       { setAddError('Date is required.'); return }
    if (!newEvent.slot_time.trim()) { setAddError('Time slot is required.'); return }
    if (!newEvent.location.trim())  { setAddError('Location is required.'); return }
    if (newEvent.max_participants < 1) { setAddError('Capacity must be at least 1.'); return }

    // Client-side duplicate check
    const duplicate = events.find(
      e => e.name.trim().toLowerCase() === newEvent.name.trim().toLowerCase() &&
           e.age_group === newEvent.age_group &&
           (e as any).event_date === newEvent.event_date
    )
    if (duplicate) {
      setAddError(
        `"${newEvent.name}" for ${newEvent.age_group} already exists on this date (${duplicate.slot_time}). Each age group can only have one slot per day.`
      )
      return
    }
    setAddError(null)
    startTransition(async () => {
      const res = await createEvent({
        ...newEvent,
        max_participants: Number(newEvent.max_participants),
      })
      if (res.success) {
        setAddSuccess(true)
        setNewEvent({ ...BLANK_NEW })
        setTimeout(() => { setAddSuccess(false); setShowAddForm(false) }, 3000)
      } else {
        setAddError(res.message)
      }
    })
  }

  const locationOptions = locations.map(l => l.name)
  const existingNames = [...new Set(events.map(e => e.name))].sort()

  return (
    <div className="space-y-5">

      {/* ── Header + Add button ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-slate-500">
          Edit time, venue, or capacity for any slot. Toggle to show/hide from the registration form.
        </p>
        <button
          onClick={() => { setShowAddForm(v => !v); setAddError(null); setAddSuccess(false) }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} />
          Add Event
        </button>
      </div>

      {/* ── Add Event Form ── */}
      {showAddForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Plus size={15} className="text-orange-500" /> New Event Slot
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name — datalist so admin can reuse an existing activity name or type new */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Activity Name <span className="text-red-400">*</span>
              </label>
              <input
                list="activity-names"
                value={newEvent.name}
                onChange={e => setNew('name', e.target.value)}
                placeholder="e.g. Painting Competition"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              />
              <datalist id="activity-names">
                {existingNames.map(n => <option key={n} value={n} />)}
              </datalist>
              <p className="text-xs text-slate-400 mt-1">
                Pick an existing name to add another age-group slot, or type a new activity.
              </p>
            </div>

            {/* Age group */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Age Group <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={newEvent.age_group}
                  onChange={e => setNew('age_group', e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 pr-8 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  {AGE_GROUPS.map(g => (
                    <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                <Users size={12} className="inline mr-1" /> Max Participants <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={newEvent.max_participants}
                onChange={e => setNew('max_participants', Number(e.target.value))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={newEvent.event_date}
                onChange={e => setNew('event_date', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Time slot */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                <Clock size={12} className="inline mr-1" /> Time Slot <span className="text-red-400">*</span>
              </label>
              <input
                value={newEvent.slot_time}
                onChange={e => setNew('slot_time', e.target.value)}
                placeholder="09:00 AM – 10:30 AM"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                <MapPin size={12} className="inline mr-1" /> Location <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={newEvent.location}
                  onChange={e => setNew('location', e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 pr-8 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="">Select a venue…</option>
                  {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                <FileText size={12} className="inline mr-1" /> Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={e => setNew('description', e.target.value)}
                rows={2}
                placeholder="Short description…"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
          </div>

          {/* MD file note */}
          <div className="flex items-start gap-2 bg-white border border-orange-100 rounded-lg p-3 text-xs text-slate-500">
            <Info size={13} className="text-orange-400 shrink-0 mt-0.5" />
            <span>
              This saves the event to Supabase immediately so registrations work.
              To persist it across re-deployments, also copy the entry into{' '}
              <code className="bg-slate-100 px-1 rounded">content/events.md</code> and run{' '}
              <code className="bg-slate-100 px-1 rounded">npm run sync-events</code>.
            </span>
          </div>

          {addError && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle size={12} /> {addError}
            </p>
          )}
          {addSuccess && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Check size={12} /> Event created successfully! The page will refresh shortly.
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={submitNew}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isPending ? 'Saving…' : <><Check size={14} /> Save Event</>}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setAddError(null) }}
              className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Delete error banner ── */}
      {deleteError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {confirmDeleteId && (() => {
        const target = events.find(e => e.id === confirmDeleteId)
        const regCount = target?.registrations[0]?.count ?? 0
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Delete event?</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {target?.name} · {target?.age_group} · {(target as any)?.event_date ?? 'no date'}
                  </p>
                </div>
              </div>

              {regCount > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    This event has <strong>{regCount} registration(s)</strong>. It cannot be deleted — use the toggle to hide it instead.
                  </span>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  This event has no registrations and will be permanently removed. This cannot be undone.
                </p>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                {regCount === 0 && (
                  <button
                    onClick={() => handleDelete(confirmDeleteId)}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {isPending ? 'Deleting…' : 'Delete permanently'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Existing events grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {events.map((event) => {
          const count     = event.registrations[0]?.count ?? 0
          const isActive  = localActive[event.id] ?? event.is_active
          const capacity  = isEditing(event, editingId) ? editValues.max_participants : event.max_participants
          const pct       = Math.min(Math.round((count / (capacity || 1)) * 100), 100)
          const isFull    = count >= capacity
          const isEditingThis = editingId === event.id
          const wasSaved  = savedId === event.id

          return (
            <div
              key={event.id}
              className={`
                bg-white rounded-xl border p-5 shadow-sm transition-all
                ${isEditingThis ? 'border-orange-300 ring-2 ring-orange-100 col-span-1 lg:col-span-2' : ''}
                ${wasSaved      ? 'border-green-300' : !isEditingThis ? 'border-slate-200 hover:border-slate-300' : ''}
                ${!isActive     ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800">{event.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${AGE_GROUP_COLORS[event.age_group]}`}>
                      {event.age_group}
                    </span>
                    {!isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Hidden</span>}
                    {wasSaved  && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Check size={12} /> Saved</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(event)}
                    disabled={isPending}
                    title={isActive ? 'Hide from form' : 'Show on form'}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {isActive ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                  </button>
                  {!isEditingThis ? (
                    <>
                      <button onClick={() => startEdit(event)} className="p-2 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => { setConfirmDeleteId(event.id); setDeleteError(null) }}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => saveEdit(event.id)} disabled={isPending}
                        className="p-2 rounded-lg text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 transition-colors">
                        <Check size={16} />
                      </button>
                      <button onClick={cancelEdit} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isEditingThis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Date</label>
                      <input type="date" value={editValues.event_date ?? ''}
                        onChange={e => set('event_date', e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Clock size={12} /> Time Slot</label>
                      <input value={editValues.slot_time} onChange={e => set('slot_time', e.target.value)}
                        placeholder="09:00 AM – 10:30 AM"
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><Users size={12} /> Max Participants</label>
                      <input type="number" min={1} value={editValues.max_participants}
                        onChange={e => set('max_participants', Number(e.target.value))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><MapPin size={12} /> Location</label>
                    <div className="relative">
                      <select value={editValues.location} onChange={e => set('location', e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 pr-8 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300">
                        {locations.map(loc => (
                          <option key={loc.name} value={loc.name}>{loc.name}{loc.capacity ? ` — ${loc.capacity}` : ''}</option>
                        ))}
                        {!locations.find(l => l.name === editValues.location) && (
                          <option value={editValues.location}>{editValues.location}</option>
                        )}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1"><FileText size={12} /> Description</label>
                    <textarea value={editValues.description} onChange={e => set('description', e.target.value)}
                      rows={2} placeholder="Short description…"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
                  </div>
                  {errorMsg && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> {errorMsg}</p>}
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
                  {event.description && <p className="text-xs text-slate-400 mb-3 leading-relaxed">{event.description}</p>}
                </>
              )}

              <div className={isEditingThis ? 'mt-4 pt-4 border-t border-slate-100' : ''}>
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
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Helper outside component to avoid inline ternary confusion
function isEditing(event: EventWithCount, editingId: string | null) {
  return editingId === event.id
}
