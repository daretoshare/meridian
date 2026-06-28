'use client'

import { useState, useMemo, useTransition } from 'react'
import { updateRegistrationStatus } from '@/actions/admin'
import type { RegistrationWithDetails, Event } from '@/types/database'
import { Download, Filter, ChevronDown, Search, X, Check } from 'lucide-react'

const STATUS_STYLES = {
  confirmed:  'bg-green-100 text-green-700 border-green-200',
  waitlisted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  cancelled:  'bg-red-100 text-red-700 border-red-200',
}

interface Props {
  registrations: RegistrationWithDetails[]
  events: Event[]
}

interface PendingChange {
  regId: string
  status: 'confirmed' | 'waitlisted' | 'cancelled'
  reason: string
}

export default function RegistrationsTable({ registrations, events }: Props) {
  const [filterEvent, setFilterEvent]   = useState<string>('all')
  const [filterBlock, setFilterBlock]   = useState<string>('all')
  const [search, setSearch]             = useState('')
  const [isPending, startTransition]    = useTransition()
  const [pending, setPending]           = useState<PendingChange | null>(null)

  const blocks = useMemo(
    () => [...new Set(registrations.map((r) => r.profiles.block))].sort(),
    [registrations]
  )

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      const matchEvent  = filterEvent === 'all' || r.event_id === filterEvent
      const matchBlock  = filterBlock === 'all' || r.profiles.block === filterBlock
      const matchSearch =
        !search ||
        r.profiles.full_name.toLowerCase().includes(search.toLowerCase()) ||
        r.profiles.email.toLowerCase().includes(search.toLowerCase()) ||
        r.profiles.apartment_number.toLowerCase().includes(search.toLowerCase())
      return matchEvent && matchBlock && matchSearch
    })
  }, [registrations, filterEvent, filterBlock, search])

  const onStatusSelect = (regId: string, status: 'confirmed' | 'waitlisted' | 'cancelled') => {
    if (status === 'confirmed') {
      // Confirmed: no reason needed, apply immediately
      startTransition(async () => {
        await updateRegistrationStatus(regId, 'confirmed')
      })
    } else {
      // Waitlisted / Cancelled: ask for reason first
      setPending({ regId, status, reason: '' })
    }
  }

  const submitWithReason = () => {
    if (!pending) return
    startTransition(async () => {
      await updateRegistrationStatus(pending.regId, pending.status, pending.reason)
      setPending(null)
    })
  }

  const exportCSV = () => {
    const header = ['Name', 'Tower', 'Apartment', 'Phone', 'Email', 'Event', 'Age Group', 'Slot', 'Location', 'Status', 'Reason']
    const rows = filtered.map((r) => [
      r.profiles.full_name,
      r.profiles.block,
      r.profiles.apartment_number,
      r.profiles.phone_number,
      r.profiles.email,
      r.events.name,
      r.events.age_group,
      r.events.slot_time,
      r.events.location,
      r.status,
      (r as any).reason ?? '',
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `meridian-park-registrations-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">

      {/* ── Reason modal ── */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full space-y-4">
            <p className="font-semibold text-slate-800 capitalize">
              Mark as {pending.status}
            </p>
            <p className="text-sm text-slate-500">
              Provide a reason — this will be visible to the resident on the status page.
            </p>
            <textarea
              value={pending.reason}
              onChange={e => setPending(p => p ? { ...p, reason: e.target.value } : p)}
              rows={3}
              placeholder={
                pending.status === 'cancelled'
                  ? 'e.g. Event capacity reached, duplicate registration…'
                  : 'e.g. Event is full — you are on the waiting list…'
              }
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setPending(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1">
                <X size={13} /> Cancel
              </button>
              <button onClick={submitWithReason} disabled={isPending}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50
                  ${pending.status === 'cancelled' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                <Check size={13} /> {isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, apartment…"
            className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}
            className="pl-8 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none">
            <option value="all">All Events</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.name} – {e.age_group}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}
            className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none">
            <option value="all">All Towers</option>
            {blocks.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <p className="text-sm text-slate-500">Showing {filtered.length} of {registrations.length} registrations</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Name', 'Tower / Apt.', 'Contact', 'Event', 'Slot', 'Location', 'Status', 'Reason', 'Change Status'].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">No registrations match your filters.</td></tr>
            ) : (
              filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{reg.profiles.full_name}</p>
                    <p className="text-xs text-slate-400">{reg.profiles.block}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{reg.profiles.apartment_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-slate-600">{reg.profiles.phone_number}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[160px]">{reg.profiles.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{reg.events.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{reg.events.age_group}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{reg.events.slot_time}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{reg.events.location}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium capitalize ${STATUS_STYLES[reg.status]}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px]">
                    {(reg as any).reason
                      ? <span className="italic">"{(reg as any).reason}"</span>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={reg.status}
                      disabled={isPending}
                      onChange={(e) => onStatusSelect(reg.id, e.target.value as 'confirmed' | 'waitlisted' | 'cancelled')}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="waitlisted">Waitlisted</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
