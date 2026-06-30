'use client'

import { useState, useMemo, useTransition } from 'react'
import { updateRegistrationStatus } from '@/actions/admin'
import type { RegistrationWithDetails } from '@/types/database'
import { Download, Search, X, Check, FileText, Users, ChevronDown } from 'lucide-react'

interface TeamMember {
  name: string
  tower: string
  apartment_number: string
  phone_number: string
}

interface Props {
  registrations: RegistrationWithDetails[]
}

const STATUS_STYLES = {
  confirmed:  'bg-green-100 text-green-700 border-green-200',
  waitlisted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  cancelled:  'bg-red-100 text-red-700 border-red-200',
}

function shortId(id: string) { return id.slice(0, 8).toUpperCase() }

function getMemberList(reg: RegistrationWithDetails): TeamMember[] {
  return (reg as any).team_members ?? []
}

export default function TeamRegistrationsTable({ registrations }: Props) {
  const [search, setSearch]           = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [isPending, startTransition]  = useTransition()
  const [pending, setPending]         = useState<{ regId: string; status: 'confirmed' | 'waitlisted' | 'cancelled'; reason: string } | null>(null)

  const teamRegs = useMemo(
    () => registrations.filter(r => (r.events as any).is_team === true),
    [registrations],
  )

  const filtered = useMemo(() => {
    if (!search) return teamRegs
    const q = search.toLowerCase()
    return teamRegs.filter(r =>
      r.profiles.full_name.toLowerCase().includes(q) ||
      r.profiles.phone_number.includes(q) ||
      r.profiles.apartment_number.toLowerCase().includes(q) ||
      ((r as any).team_name ?? '').toLowerCase().includes(q) ||
      r.events.name.toLowerCase().includes(q) ||
      r.id.toUpperCase().includes(search.toUpperCase()) ||
      getMemberList(r).some(m => m.name.toLowerCase().includes(q) || m.phone_number.includes(q)),
    )
  }, [teamRegs, search])

  const toggleRow = (id: string) =>
    setExpandedRows(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

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

  // ── CSV export ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const header = [
      'Reg ID', 'Event', 'Age Group', 'Type', 'Team Name',
      'Registrant Name', 'Tower', 'Apartment', 'Phone', 'Email',
      'Member 1', 'Member 2', 'Member 3', 'Member 4', 'Member 5',
      'Status',
    ]
    const rows = filtered.map(r => {
      const members = getMemberList(r)
      const memberCells = Array.from({ length: 5 }, (_, i) => {
        const m = members[i]
        return m ? `${m.name} | ${m.tower} | ${m.apartment_number} | ${m.phone_number}` : ''
      })
      return [
        shortId(r.id),
        r.events.name,
        r.events.age_group,
        (r.events as any).registration_type ?? 'competitive',
        (r as any).team_name ?? '',
        r.profiles.full_name,
        r.profiles.block,
        r.profiles.apartment_number,
        r.profiles.phone_number,
        r.profiles.email,
        ...memberCells,
        r.status,
      ]
    })
    const csv = [header, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `meridian-team-registrations-${new Date().toISOString().slice(0, 10)}.csv` })
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── PDF export ──────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

    const sections = filtered.map(r => {
      const members  = getMemberList(r)
      const teamName = (r as any).team_name as string | null
      const allPeople = [
        { role: 'Registrant', name: r.profiles.full_name, tower: r.profiles.block, apt: r.profiles.apartment_number, phone: r.profiles.phone_number, email: r.profiles.email },
        ...members.map(m => ({ role: 'Member', name: m.name, tower: m.tower, apt: m.apartment_number, phone: m.phone_number, email: '' })),
      ]

      return `
      <div class="card">
        <div class="card-header">
          <span class="reg-id">${shortId(r.id)}</span>
          <span class="event-name">${r.events.name}</span>
          <span class="age">${r.events.age_group}</span>
          <span class="status ${r.status}">${r.status}</span>
        </div>
        ${teamName ? `<div class="team-name">Team: <strong>${teamName}</strong></div>` : ''}
        <table class="members-table">
          <thead><tr><th>Role</th><th>Name</th><th>Tower</th><th>Apartment</th><th>Phone</th><th>Email</th></tr></thead>
          <tbody>
            ${allPeople.map(p => `
            <tr>
              <td><span class="role-badge ${p.role === 'Registrant' ? 'role-reg' : 'role-mem'}">${p.role}</span></td>
              <td class="bold">${p.name}</td>
              <td>${p.tower}</td>
              <td class="mono">${p.apt}</td>
              <td>${p.phone}</td>
              <td class="small">${p.email}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`
    }).join('')

    const html = `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"/>
  <title>Meridian Park — Team Registrations</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Arial,sans-serif; font-size:11px; color:#1e293b; padding:24px; }
    h1 { font-size:17px; font-weight:700; }
    .meta { font-size:10px; color:#64748b; margin:4px 0 20px; }
    .card { border:1px solid #e2e8f0; border-radius:8px; margin-bottom:14px; overflow:hidden; page-break-inside:avoid; }
    .card-header { display:flex; align-items:center; gap:10px; background:#f8fafc; padding:8px 12px; border-bottom:1px solid #e2e8f0; flex-wrap:wrap; }
    .reg-id { font-family:monospace; font-weight:700; font-size:12px; background:#1e293b; color:#fff; padding:2px 7px; border-radius:4px; }
    .event-name { font-weight:600; font-size:12px; flex:1; }
    .age { font-size:9px; font-weight:600; background:#f1f5f9; color:#64748b; padding:2px 6px; border-radius:10px; text-transform:capitalize; }
    .status { font-size:9px; font-weight:700; text-transform:capitalize; padding:2px 6px; border-radius:10px; }
    .status.confirmed  { background:#dcfce7; color:#16a34a; }
    .status.waitlisted { background:#fef9c3; color:#b45309; }
    .status.cancelled  { background:#fee2e2; color:#dc2626; }
    .team-name { padding:5px 12px; font-size:11px; color:#1d4ed8; border-bottom:1px solid #e2e8f0; background:#eff6ff; }
    .members-table { width:100%; border-collapse:collapse; }
    .members-table th { background:#f1f5f9; padding:5px 10px; font-size:9px; text-transform:uppercase; letter-spacing:.04em; text-align:left; }
    .members-table td { padding:6px 10px; border-top:1px solid #f8fafc; vertical-align:top; }
    .members-table tr:nth-child(even) td { background:#fafafa; }
    .role-badge { font-size:8px; font-weight:700; padding:2px 5px; border-radius:8px; }
    .role-reg { background:#dcfce7; color:#15803d; }
    .role-mem { background:#dbeafe; color:#1d4ed8; }
    .bold { font-weight:600; }
    .mono { font-family:monospace; }
    .small { font-size:9px; color:#64748b; }
    .footer { margin-top:20px; font-size:10px; color:#94a3b8; text-align:right; }
    @media print { body { padding:0; } }
  </style>
</head>
<body>
  <h1>Meridian Park — Team Event Registrations</h1>
  <p class="meta">Exported ${now} &nbsp;·&nbsp; ${filtered.length} team registration(s)</p>
  ${sections}
  <p class="footer">Meridian Park Independence Day 2026</p>
  <script>window.onload = () => window.print()</script>
</body></html>`

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
              placeholder="e.g. Event capacity reached…"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setPending(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1">
                <X size={13} /> Cancel
              </button>
              <button onClick={submitWithReason} disabled={isPending}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-1 disabled:opacity-50 ${pending.status === 'cancelled' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
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
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, team name, event, Reg ID…"
            className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap">
            <Download size={14} /> CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap">
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">Showing {filtered.length} of {teamRegs.length} team registration(s)</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users size={32} className="mx-auto mb-3 opacity-40" />
          <p>{teamRegs.length === 0 ? 'No team event registrations yet.' : 'No results match your search.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(reg => {
            const members  = getMemberList(reg)
            const teamName = (reg as any).team_name as string | null
            const isOpen   = expandedRows.has(reg.id)

            return (
              <div key={reg.id} className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Card header */}
                <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                  <span className="font-mono text-xs font-bold bg-slate-800 text-white px-2 py-0.5 rounded">
                    {shortId(reg.id)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${(reg.events as any).registration_type === 'cultural' ? 'bg-pink-100 text-pink-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {(reg.events as any).registration_type === 'cultural' ? 'Cultural' : 'Competitive'}
                      </span>
                      <span className="font-semibold text-slate-800 text-sm">{reg.events.name}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border capitalize
                        bg-blue-100 text-blue-800 border-blue-200">
                        {reg.events.age_group}
                      </span>
                    </div>
                    {teamName && (
                      <p className="text-xs text-blue-600 font-medium mt-0.5">
                        <Users size={11} className="inline mr-1" />Team: {teamName}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium capitalize ${STATUS_STYLES[reg.status]}`}>
                    {reg.status}
                  </span>
                  <select
                    defaultValue={reg.status}
                    disabled={isPending}
                    onChange={e => onStatusSelect(reg.id, e.target.value as 'confirmed' | 'waitlisted' | 'cancelled')}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {members.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleRow(reg.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
                      <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Participants table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/60 border-b border-slate-100">
                      <tr>
                        {['Role', 'Name', 'Tower', 'Apartment', 'Phone'].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {/* Registrant row — always visible */}
                      <tr className="bg-green-50/40">
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Registrant</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{reg.profiles.full_name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{reg.profiles.email}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{reg.profiles.block}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{reg.profiles.apartment_number}</td>
                        <td className="px-4 py-3 text-slate-600">{reg.profiles.phone_number}</td>
                      </tr>

                      {/* Member rows — collapsible */}
                      {(isOpen || members.length === 0) && members.map((m, i) => (
                        <tr key={i} className="bg-blue-50/30">
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Member {i + 1}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-700">{m.name || <span className="text-slate-300 italic">—</span>}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{m.tower}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600">{m.apartment_number}</td>
                          <td className="px-4 py-3 text-slate-600">{m.phone_number}</td>
                        </tr>
                      ))}

                      {/* Collapse hint when members exist but closed */}
                      {!isOpen && members.length > 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-2 text-center">
                            <button onClick={() => toggleRow(reg.id)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                              Show {members.length} team member{members.length !== 1 ? 's' : ''} ↓
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
