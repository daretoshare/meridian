'use client'

import { useState, useMemo, useTransition } from 'react'
import { updateRegistrationStatus } from '@/actions/admin'
import type { RegistrationWithDetails, Event } from '@/types/database'
import { Download, Filter, ChevronDown, Search } from 'lucide-react'

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  waitlisted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

interface Props {
  registrations: RegistrationWithDetails[]
  events: Event[]
}

export default function RegistrationsTable({ registrations, events }: Props) {
  const [filterEvent, setFilterEvent] = useState<string>('all')
  const [filterBlock, setFilterBlock] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const blocks = useMemo(
    () => [...new Set(registrations.map((r) => r.profiles.block))].sort(),
    [registrations]
  )

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      const matchEvent = filterEvent === 'all' || r.event_id === filterEvent
      const matchBlock = filterBlock === 'all' || r.profiles.block === filterBlock
      const matchSearch =
        !search ||
        r.profiles.full_name.toLowerCase().includes(search.toLowerCase()) ||
        r.profiles.email.toLowerCase().includes(search.toLowerCase()) ||
        r.profiles.apartment_number.toLowerCase().includes(search.toLowerCase())
      return matchEvent && matchBlock && matchSearch
    })
  }, [registrations, filterEvent, filterBlock, search])

  const handleStatusChange = (id: string, status: 'confirmed' | 'waitlisted' | 'cancelled') => {
    setUpdatingId(id)
    startTransition(async () => {
      await updateRegistrationStatus(id, status)
      setUpdatingId(null)
    })
  }

  const exportCSV = () => {
    const header = ['Name', 'Tower', 'Apartment', 'Phone', 'Email', 'Event', 'Age Group', 'Slot', 'Location', 'Status', 'Registered At']
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
      new Date(r.created_at).toLocaleString('en-IN'),
    ])

    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meridian-park-registrations-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, apartment…"
            className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>

        {/* Event Filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="pl-8 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none"
          >
            <option value="all">All Events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} – {e.age_group}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Block Filter */}
        <div className="relative">
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none"
          >
            <option value="all">All Towers</option>
            {blocks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Export */}
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <p className="text-sm text-slate-500">
        Showing {filtered.length} of {registrations.length} registrations
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Name', 'Tower / Apt.', 'Contact', 'Event', 'Slot', 'Location', 'Status', 'Actions'].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  No registrations match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{reg.profiles.full_name}</p>
                    <p className="text-xs text-slate-400">{reg.profiles.block}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{reg.profiles.apartment_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-slate-600">{reg.profiles.phone_number}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[160px]">
                      {reg.profiles.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{reg.events.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{reg.events.age_group}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{reg.events.slot_time}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{reg.events.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium capitalize ${STATUS_STYLES[reg.status]}`}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={reg.status}
                      disabled={isPending && updatingId === reg.id}
                      onChange={(e) =>
                        handleStatusChange(
                          reg.id,
                          e.target.value as 'confirmed' | 'waitlisted' | 'cancelled'
                        )
                      }
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
