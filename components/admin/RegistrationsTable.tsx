'use client'

import { useState, useMemo, useTransition } from 'react'
import { updateRegistrationStatus } from '@/actions/admin'
import type { RegistrationWithDetails, Event } from '@/types/database'
import { Download, Filter, ChevronDown, Search, X, Check, FileText } from 'lucide-react'

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

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
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
        r.profiles.apartment_number.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toUpperCase().includes(search.toUpperCase())
      return matchEvent && matchBlock && matchSearch
    })
  }, [registrations, filterEvent, filterBlock, search])

  const onStatusSelect = (regId: string, status: 'confirmed' | 'waitlisted' | 'cancelled') => {
    if (status === 'confirmed') {
      startTransition(async () => { await updateRegistrationStatus(regId, 'confirmed') })
    } else {
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
    const header = ['Reg ID', 'Name', 'Tower', 'Apartment', 'Phone', 'Email', 'Event', 'Age Group', 'Date', 'Slot', 'Location', 'Status', 'Reason']
    const rows = filtered.map((r) => [
      shortId(r.id),
      r.profiles.full_name,
      r.profiles.block,
      r.profiles.apartment_number,
      r.profiles.phone_number,
      r.profiles.email,
      r.events.name,
      r.events.age_group,
      (r.events as any).event_date ?? '',
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

  const exportPDF = () => {
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    const rows = filtered.map((r) => `
      <tr>
        <td>${shortId(r.id)}</td>
        <td>${r.profiles.full_name}</td>
        <td>${r.profiles.block} / ${r.profiles.apartment_number}</td>
        <td>${r.profiles.phone_number}<br/><small>${r.profiles.email}</small></td>
        <td>${r.events.name}<br/><small class="cap">${r.events.age_group}</small></td>
        <td>${(r.events as any).event_date ? new Date((r.events as any).event_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
        <td>${r.events.slot_time}</td>
        <td>${r.events.location}</td>
        <td class="status ${r.status}">${r.status}</td>
        <td>${(r as any).reason ?? '—'}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Meridian Park — Registrations</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 24px; }
    h1 { font-size: 18px; font-weight: 700; color: #0f172a; }
    .meta { font-size: 11px; color: #64748b; margin: 4px 0 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #f1f5f9; text-align: left; padding: 6px 8px; font-size: 10px;
         text-transform: uppercase; letter-spacing: .05em; border-bottom: 2px solid #e2e8f0; }
    td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    tr:nth-child(even) td { background: #fafafa; }
    .cap { text-transform: capitalize; color: #64748b; }
    .status { font-weight: 600; text-transform: capitalize; }
    .status.confirmed  { color: #16a34a; }
    .status.waitlisted { color: #b45309; }
    .status.cancelled  { color: #dc2626; }
    small { display: block; color: #64748b; font-size: 10px; }
    .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: right; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Meridian Park — Event Registrations</h1>
  <p class="meta">Exported ${now} &nbsp;·&nbsp; ${filtered.length} registration(s) shown</p>
  <table>
    <thead>
      <tr>
        <th>Reg ID</th><th>Name</th><th>Tower / Apt</th><th>Contact</th>
        <th>Event</th><th>Date</th><th>Time</th><th>Venue</th><th>Status</th><th>Reason</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">Meridian Park Independence Day 2025</p>
  <script>window.onload = () => { window.print() }</script>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close() }
  }

  return (
    <div className="space-y-4">

      {/* Reason modal */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full space-y-4">
            <p className="font-semibold text-slate-800 capitalize">Mark as {pending.status}</p>
            <p className="text-sm text-slate-500">Provide a reason — visible to the resident on the status page.</p>
            <textarea
              value={pending.reason}
              onChange={e => setPending(p => p ? { ...p, reason: e.target.value } : p)}
              rows={3}
              placeholder={pending.status === 'cancelled'
                ? 'e.g. Event capacity reached, duplicate registration…'
                : 'e.g. Event is full — you are on the waiting list…'}
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
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, apt, or Reg ID…"
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

        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap">
            <Download size={14} /> CSV
          </button>
          <button onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap">
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">Showing {filtered.length} of {registrations.length} registrations</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Reg ID', 'Name', 'Tower / Apt.', 'Contact', 'Event', 'Date', 'Slot', 'Location', 'Status', 'Reason', 'Change Status'].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={11} className="px-4 py-12 text-center text-slate-400">No registrations match your filters.</td></tr>
            ) : (
              filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {shortId(reg.id)}
                    </span>
                  </td>
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
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">
                    {(reg.events as any).event_date
                      ? new Date((reg.events as any).event_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{reg.events.slot_time}</td>
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
