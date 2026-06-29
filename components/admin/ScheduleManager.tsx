'use client'

import { useState, useMemo, useTransition, Fragment } from 'react'
import { updateEvent, createEvent, deleteEvent } from '@/actions/admin'
import type { EventEdits } from '@/actions/admin'
import type { EventWithCount } from '@/types/database'
import type { ContentLocation } from '@/lib/content'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown,
  Users, AlertCircle, Calendar, Clock,
} from 'lucide-react'

interface Props {
  events: EventWithCount[]
  locations: ContentLocation[]
}

type StatusFilter = 'active' | 'hidden' | 'all'
type TypeFilter   = 'all' | 'competitive' | 'cultural'

const SECTION_LABELS: Record<string, string> = {
  competitive: '🏆 Competitive',
  cultural:    '🎭 Cultural',
  open:        '🌐 Open',
}

const AGE_COLORS: Record<string, string> = {
  children: 'bg-yellow-100 text-yellow-700',
  teens:    'bg-blue-100   text-blue-700',
  adults:   'bg-green-100  text-green-700',
  seniors:  'bg-purple-100 text-purple-700',
  all:      'bg-orange-100 text-orange-700',
}

const BLANK_NEW = {
  name: '', age_group: 'adults', event_date: '',
  slot_time: '', location: '', max_participants: 30, description: '',
  registration_type: 'competitive', is_team: false,
}

export default function ScheduleManager({ events, locations }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId]    = useState<string | null>(null)
  const [editForm,  setEditForm]     = useState<Partial<EventEdits>>({})
  const [deletingId, setDeletingId]  = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent,    setNewEvent]    = useState({ ...BLANK_NEW })
  const [error,  setError]  = useState<string | null>(null)
  const [addErr, setAddErr] = useState<string | null>(null)

  // ── Local active state (optimistic toggle) ────────────────────────────────
  const [localActive, setLocalActive] = useState<Record<string, boolean>>({})
  const isActive = (e: EventWithCount) => localActive[e.id] ?? e.is_active

  // ── Filters ──────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [typeFilter,   setTypeFilter]   = useState<TypeFilter>('all')

  // ── Collapsed sections ────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const toggleCollapse = (k: string) => setCollapsed(p => ({ ...p, [k]: !p[k] }))

  // ── Edit helpers ──────────────────────────────────────────────────────────
  const startEdit = (e: EventWithCount) => {
    setEditingId(e.id)
    setEditForm({
      event_date: e.event_date ?? '', slot_time: e.slot_time,
      location: e.location, max_participants: e.max_participants,
      description: e.description ?? '', is_active: e.is_active,
    })
    setError(null)
  }
  const cancelEdit = () => { setEditingId(null); setEditForm({}); setError(null) }

  const saveEdit = () => {
    if (!editingId) return
    startTransition(async () => {
      const res = await updateEvent(editingId, editForm)
      if (res.success) cancelEdit()
      else setError(res.message)
    })
  }

  const handleToggle = (e: EventWithCount) => {
    const next = !isActive(e)
    setLocalActive(p => ({ ...p, [e.id]: next }))
    startTransition(async () => {
      const res = await updateEvent(e.id, { is_active: next })
      if (!res.success) {
        setLocalActive(p => ({ ...p, [e.id]: !next }))
        setError(res.message)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteEvent(id)
      if (res.success) setDeletingId(null)
      else setError(res.message)
    })
  }

  const handleAdd = () => {
    if (!newEvent.name.trim())      { setAddErr('Name is required.'); return }
    if (!newEvent.slot_time.trim()) { setAddErr('Time slot is required.'); return }
    if (!newEvent.location.trim())  { setAddErr('Venue is required.'); return }
    setAddErr(null)
    startTransition(async () => {
      const res = await createEvent(newEvent)
      if (res.success) {
        setShowAddForm(false)
        setNewEvent({ ...BLANK_NEW })
      } else {
        setAddErr(res.message)
      }
    })
  }

  // ── Filtered + grouped events ─────────────────────────────────────────────
  const grouped = useMemo(() => {
    const g: Record<string, EventWithCount[]> = {}
    for (const e of events) {
      const active  = localActive[e.id] ?? e.is_active
      const regType = (e as any).registration_type ?? 'competitive'
      if (statusFilter === 'active' && !active) continue
      if (statusFilter === 'hidden' && active)  continue
      if (typeFilter !== 'all' && regType !== typeFilter) continue
      if (!g[regType]) g[regType] = []
      g[regType].push(e)
    }
    // Sort each section by event_date then name
    for (const k of Object.keys(g)) {
      g[k].sort((a, b) => {
        const da = (a as any).event_date ?? '9999'
        const db = (b as any).event_date ?? '9999'
        if (da !== db) return da.localeCompare(db)
        return a.name.localeCompare(b.name)
      })
    }
    return g
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, localActive, statusFilter, typeFilter])

  const sectionOrder  = ['competitive', 'cultural', 'open']
  const sections      = sectionOrder.filter(k => grouped[k])
  const totalActive   = events.filter(e => isActive(e)).length
  const totalHidden   = events.filter(e => !isActive(e)).length
  const totalRegs     = events.reduce((s, e) => s + (e.registrations?.[0]?.count ?? 0), 0)

  return (
    <div className="space-y-6">

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Events',        value: events.length },
          { label: 'Active',              value: totalActive },
          { label: 'Hidden',              value: totalHidden },
          { label: 'Total Registrations', value: totalRegs },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          <AlertCircle size={15} className="shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
          {(['active', 'hidden', 'all'] as StatusFilter[]).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 capitalize transition-colors
                ${statusFilter === f ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
        {/* Type */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
          {(['all', 'competitive', 'cultural'] as TypeFilter[]).map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 capitalize transition-colors
                ${typeFilter === f ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button onClick={() => setShowAddForm(p => !p)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors">
            <Plus size={14} /> Add Event
          </button>
        </div>
      </div>

      {/* ── Add Event Panel ───────────────────────────────────────────────── */}
      {showAddForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-orange-900 flex items-center gap-2">
            <Plus size={15} /> New Event
          </p>
          {addErr && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle size={13} /> {addErr}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Event Name</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="100m Run" value={newEvent.name}
                onChange={e => setNewEvent(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={newEvent.registration_type}
                onChange={e => setNewEvent(p => ({ ...p, registration_type: e.target.value }))}>
                <option value="competitive">Competitive</option>
                <option value="cultural">Cultural</option>
                <option value="open">Open</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Age Group</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={newEvent.age_group}
                onChange={e => setNewEvent(p => ({ ...p, age_group: e.target.value }))}>
                {['children', 'teens', 'adults', 'seniors', 'all'].map(ag =>
                  <option key={ag} value={ag} className="capitalize">{ag}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tentative Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={newEvent.event_date}
                onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Time Slot</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="09:00–11:00 AM" value={newEvent.slot_time}
                onChange={e => setNewEvent(p => ({ ...p, slot_time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Venue</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Clubhouse Hall 1" value={newEvent.location}
                onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Capacity</label>
              <input type="number" min={1} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={newEvent.max_participants}
                onChange={e => setNewEvent(p => ({ ...p, max_participants: Number(e.target.value) }))} />
            </div>
            <div className="col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description (optional)</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Short description…" value={newEvent.description}
                onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" id="add-team" checked={newEvent.is_team}
                onChange={e => setNewEvent(p => ({ ...p, is_team: e.target.checked }))} />
              <label htmlFor="add-team" className="text-sm text-slate-700">Team event</label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} disabled={isPending || !newEvent.name}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50">
              {isPending ? 'Saving…' : 'Create Event'}
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Event tables by section ────────────────────────────────────────── */}
      {sections.length === 0 && (
        <div className="py-16 text-center text-slate-400">
          <Calendar size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No events match the current filters.</p>
        </div>
      )}

      {sections.map(sectionKey => {
        const sectionEvents = grouped[sectionKey]
        const isCollapsed   = collapsed[sectionKey]
        const sectionRegs   = sectionEvents.reduce((s, e) => s + (e.registrations?.[0]?.count ?? 0), 0)

        return (
          <div key={sectionKey} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
            {/* Section header */}
            <button
              onClick={() => toggleCollapse(sectionKey)}
              className="w-full flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <span className="font-semibold text-slate-800">
                {SECTION_LABELS[sectionKey] ?? sectionKey}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                {sectionEvents.length} event{sectionEvents.length !== 1 ? 's' : ''} · {sectionRegs} registrations
              </span>
              <span className="ml-auto text-slate-400">
                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </span>
            </button>

            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                      <th className="px-4 py-2 text-left font-semibold w-6">St</th>
                      <th className="px-4 py-2 text-left font-semibold">Event</th>
                      <th className="px-4 py-2 text-left font-semibold">Age</th>
                      <th className="px-4 py-2 text-left font-semibold">Date</th>
                      <th className="px-4 py-2 text-left font-semibold">Time</th>
                      <th className="px-4 py-2 text-left font-semibold">Venue</th>
                      <th className="px-4 py-2 text-center font-semibold">Fill</th>
                      <th className="px-4 py-2 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sectionEvents.map(event => {
                      const regs      = event.registrations?.[0]?.count ?? 0
                      const cap       = event.max_participants
                      const fillPct   = cap > 0 ? Math.min(100, Math.round(regs / cap * 100)) : 0
                      const active    = isActive(event)
                      const rawDate   = (event as any).event_date as string | null
                      const dateLabel = rawDate
                        ? new Date(rawDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : null
                      const isTeam    = (event as any).is_team === true
                      const isEditing = editingId === event.id

                      return (
                        <Fragment key={event.id}>
                          {/* ── Data row ──────────────────────────────────── */}
                          <tr className={`transition-colors ${
                            isEditing  ? 'bg-orange-50'
                            : !active  ? 'bg-slate-50/70 opacity-50'
                            : 'hover:bg-slate-50'}`}>

                            {/* Status dot */}
                            <td className="px-4 py-3">
                              <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-slate-300'}`} />
                            </td>

                            {/* Name */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-medium text-slate-800">{event.name}</span>
                                {isTeam && (
                                  <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Users size={9} /> Team
                                  </span>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-44">{event.description}</p>
                              )}
                            </td>

                            {/* Age */}
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${AGE_COLORS[event.age_group] ?? 'bg-slate-100 text-slate-600'}`}>
                                {event.age_group}
                              </span>
                            </td>

                            {/* Date — show tentative badge */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {dateLabel
                                ? <span className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <Clock size={9} /> Tentative: {dateLabel}
                                  </span>
                                : <span className="text-xs text-slate-400 italic">TBD</span>}
                            </td>

                            {/* Time */}
                            <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{event.slot_time || '—'}</td>

                            {/* Venue */}
                            <td className="px-4 py-3 text-xs text-slate-600 max-w-36 truncate">{event.location || '—'}</td>

                            {/* Fill bar */}
                            <td className="px-4 py-3">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-medium text-slate-700">{regs}/{cap}</span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${fillPct > 80 ? 'bg-red-500' : fillPct > 50 ? 'bg-amber-400' : 'bg-green-500'}`}
                                    style={{ width: `${fillPct}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 justify-end">
                                <button title={isEditing ? 'Cancel' : 'Edit'}
                                  onClick={() => isEditing ? cancelEdit() : startEdit(event)}
                                  className={`p-1.5 rounded-lg transition-colors
                                    ${isEditing ? 'bg-orange-100 text-orange-600' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}>
                                  <Pencil size={13} />
                                </button>
                                <button title={active ? 'Hide' : 'Activate'}
                                  onClick={() => handleToggle(event)}
                                  disabled={isPending}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40">
                                  {active ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                                <button title="Delete"
                                  onClick={() => setDeletingId(event.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* ── Inline edit row ────────────────────────────── */}
                          {isEditing && (
                            <tr>
                              <td colSpan={8} className="px-4 pb-4 pt-2 bg-orange-50 border-b border-orange-100">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-orange-800 mb-1">Tentative Date</label>
                                    <input type="date"
                                      className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                                      value={(editForm.event_date as string) ?? ''}
                                      onChange={e => setEditForm(p => ({ ...p, event_date: e.target.value }))} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-orange-800 mb-1">Time Slot</label>
                                    <input
                                      className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                                      value={(editForm.slot_time as string) ?? ''}
                                      onChange={e => setEditForm(p => ({ ...p, slot_time: e.target.value }))} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-orange-800 mb-1">Venue</label>
                                    <input
                                      className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                                      value={(editForm.location as string) ?? ''}
                                      onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-orange-800 mb-1">Capacity</label>
                                    <input type="number" min={1}
                                      className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                                      value={(editForm.max_participants as number) ?? ''}
                                      onChange={e => setEditForm(p => ({ ...p, max_participants: Number(e.target.value) }))} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-orange-800 mb-1">Description</label>
                                    <input
                                      className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                                      placeholder="Short description…"
                                      value={(editForm.description as string) ?? ''}
                                      onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <button onClick={saveEdit} disabled={isPending}
                                    className="px-4 py-1.5 text-sm font-medium rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50">
                                    {isPending ? 'Saving…' : 'Save Changes'}
                                  </button>
                                  <button onClick={cancelEdit}
                                    className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      {deletingId && (() => {
        const evt  = events.find(e => e.id === deletingId)
        const regs = evt?.registrations?.[0]?.count ?? 0
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full space-y-4">
              <p className="font-semibold text-slate-800 text-lg">Delete Event?</p>
              <p className="text-sm text-slate-600">
                <strong>{evt?.name}</strong>
                {evt?.age_group && <> · <span className="capitalize">{evt.age_group}</span></>}
              </p>
              {regs > 0 && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <p>This event has <strong>{regs} registration{regs !== 1 ? 's' : ''}</strong>. All associated data will be removed.</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleDelete(deletingId)} disabled={isPending}
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                  {isPending ? 'Deleting…' : 'Yes, Delete'}
                </button>
                <button onClick={() => setDeletingId(null)}
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
