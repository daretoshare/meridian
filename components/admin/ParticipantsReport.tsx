'use client'

import { useMemo, useState } from 'react'
import { Download, Users } from 'lucide-react'
import type { RegistrationWithDetails } from '@/types/database'

interface Props {
  registrations: RegistrationWithDetails[]
}

interface UniqueParticipant {
  payRef:      string   // MP-XXXX payment reference
  name:        string
  tower:       string
  apartment:   string
  phone:       string
  email:       string
  events:      string[]
  source:      'registrant' | 'team_member'
}

function buildPayRef(index: number) {
  return `MP-${String(index + 1).padStart(4, '0')}`
}

export default function ParticipantsReport({ registrations }: Props) {
  const [search, setSearch] = useState('')

  // Build unique participant list
  // Dedup key: phone number (normalised to 10 digits)
  const participants = useMemo(() => {
    const map = new Map<string, UniqueParticipant & { eventSet: Set<string> }>()

    const upsert = (
      phone: string,
      name: string,
      tower: string,
      apartment: string,
      email: string,
      eventName: string,
      source: UniqueParticipant['source'],
    ) => {
      const key = phone.replace(/\D/g, '').slice(-10)
      if (!key || key.length < 10) return
      if (map.has(key)) {
        map.get(key)!.eventSet.add(eventName)
      } else {
        map.set(key, {
          payRef:    '',           // assigned after sort
          name, tower, apartment, phone: key, email,
          source,
          eventSet:  new Set([eventName]),
          events:    [],
        })
      }
    }

    for (const reg of registrations) {
      if (reg.status === 'cancelled') continue

      // Primary registrant
      upsert(
        reg.profiles.phone_number,
        reg.profiles.full_name,
        reg.profiles.block,
        reg.profiles.apartment_number,
        reg.profiles.email,
        reg.events.name,
        'registrant',
      )

      // Team members stored in JSONB
      const members: Array<{ name: string; tower: string; apartment_number: string; phone_number: string }> =
        (reg as any).team_members ?? []
      for (const m of members) {
        upsert(m.phone_number, m.name, m.tower, m.apartment_number, '', reg.events.name, 'team_member')
      }
    }

    // Sort by tower then apartment, assign sequential pay refs
    const sorted = [...map.values()].sort((a, b) => {
      const t = a.tower.localeCompare(b.tower)
      return t !== 0 ? t : a.apartment.localeCompare(b.apartment)
    })

    return sorted.map((p, i) => ({
      ...p,
      payRef: buildPayRef(i),
      events: [...p.eventSet],
    })) as UniqueParticipant[]
  }, [registrations])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return participants
    return participants.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.apartment.includes(q) ||
        p.tower.toLowerCase().includes(q) ||
        p.payRef.toLowerCase().includes(q),
    )
  }, [participants, search])

  const exportCSV = () => {
    const header = ['Pay Ref', 'Name', 'Tower', 'Apartment', 'Phone', 'Email', 'Events', 'Source']
    const rows = filtered.map(p => [
      p.payRef, p.name, p.tower, p.apartment, p.phone, p.email,
      p.events.join(' | '),
      p.source === 'team_member' ? 'Team Member' : 'Registrant',
    ])
    const csv = [header, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `meridian-participants-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    const rows = filtered.map(p => `
      <tr>
        <td class="mono">${p.payRef}</td>
        <td>${p.name}${p.source === 'team_member' ? ' <span class="tm-badge">Team Member</span>' : ''}</td>
        <td>${p.tower}</td>
        <td>${p.apartment}</td>
        <td>${p.phone}${p.email ? `<br/><small>${p.email}</small>` : ''}</td>
        <td class="events">${p.events.join('<br/>')}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Meridian Park — Participants &amp; Payment References</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Arial,sans-serif; font-size:11px; color:#1e293b; padding:24px; }
    h1 { font-size:16px; font-weight:700; }
    .meta { font-size:10px; color:#64748b; margin:4px 0 16px; }
    .note { background:#fffbeb; border:1px solid #fcd34d; border-radius:6px; padding:8px 12px;
            font-size:10px; color:#92400e; margin-bottom:16px; }
    table { width:100%; border-collapse:collapse; }
    th { background:#f1f5f9; text-align:left; padding:6px 8px; font-size:9px;
         text-transform:uppercase; letter-spacing:.05em; border-bottom:2px solid #e2e8f0; }
    td { padding:6px 8px; border-bottom:1px solid #f1f5f9; vertical-align:top; }
    tr:nth-child(even) td { background:#fafafa; }
    .mono { font-family:monospace; font-weight:700; font-size:12px; color:#ea580c; }
    .tm-badge { font-size:8px; font-weight:600; background:#dbeafe; color:#1d4ed8;
                padding:1px 4px; border-radius:8px; }
    .events { font-size:10px; color:#475569; }
    small { display:block; color:#94a3b8; font-size:9px; }
    .footer { margin-top:16px; font-size:10px; color:#94a3b8; text-align:right; }
    @media print { body { padding:0; } }
  </style>
</head>
<body>
  <h1>Meridian Park — Participants &amp; Payment References</h1>
  <p class="meta">Generated ${now} &nbsp;·&nbsp; ${filtered.length} unique participant(s)</p>
  <div class="note">
    <strong>Instructions for volunteers:</strong> Share the <strong>Pay Ref</strong> with each participant when collecting the ₹ 150 fee.
    Ask them to quote this reference in their payment / UPI remarks.
  </div>
  <table>
    <thead><tr>
      <th>Pay Ref</th><th>Name</th><th>Tower</th><th>Apartment</th>
      <th>Phone / Email</th><th>Events</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">Meridian Park Independence Day 2026 · Payment collection reference</p>
  <script>window.onload = () => { window.print() }</script>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close() }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users size={16} className="text-orange-500" /> Unique Participants — Fee Collection
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {participants.length} unique participant{participants.length !== 1 ? 's' : ''} identified across all registrations.
            Each gets a <strong>Pay Ref</strong> to quote in payment.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download size={12} /> CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
            <Download size={12} /> PDF Report
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="text-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
        <strong>How to use:</strong> Share the <strong>Pay Ref</strong> (e.g. MP-0012) with each participant when collecting the participation fee of <strong>₹ 150</strong>.
        Ask them to include it in their UPI payment remarks so you can match payments easily.
        Team members listed here are sourced from details entered during registration.
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, phone, apartment, Pay Ref…"
        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
      />

      <p className="text-xs text-slate-400">Showing {filtered.length} of {participants.length} participants</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Pay Ref', 'Name', 'Tower', 'Apartment', 'Phone', 'Events', 'Source'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No participants found.</td></tr>
            ) : filtered.map((p, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors align-top">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                    {p.payRef}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{p.name}</p>
                  {p.email && <p className="text-xs text-slate-400 truncate max-w-[180px]">{p.email}</p>}
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{p.tower}</td>
                <td className="px-4 py-3 text-slate-600 text-xs font-mono">{p.apartment}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{p.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.events.map(ev => (
                      <span key={ev} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{ev}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${p.source === 'team_member' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {p.source === 'team_member' ? 'Team Member' : 'Registrant'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
