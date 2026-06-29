'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Search, CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft,
  Calendar, MapPin, Info,
} from 'lucide-react'
import { createClient } from '@/lib/supabaseClient'

interface RegistrationRow {
  id: string
  status: 'confirmed' | 'waitlisted' | 'cancelled'
  reason: string | null
  events: {
    name: string
    age_group: string
    event_date: string | null
    slot_time: string
    location: string
  }
}

const STATUS_CONFIG = {
  confirmed:  { label: 'Confirmed',  icon: CheckCircle, cls: 'bg-green-50 border-green-200 text-green-700',   badge: 'bg-green-100 text-green-700' },
  waitlisted: { label: 'Waitlisted', icon: Clock,        cls: 'bg-yellow-50 border-yellow-200 text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      cls: 'bg-red-50 border-red-200 text-red-700',         badge: 'bg-red-100 text-red-700' },
}

// ── Detect what kind of identifier the user typed ────────────────────────────
function detectInputType(raw: string): 'email' | 'phone' | 'regid' | 'unknown' {
  const s = raw.trim()
  if (s.includes('@')) return 'email'
  if (/^[6-9]\d{9}$/.test(s)) return 'phone'
  if (/^[0-9A-Fa-f]{6,8}$/.test(s)) return 'regid'
  return 'unknown'
}

export default function StatusPage() {
  const [query,      setQuery]      = useState('')
  const [rows,       setRows]       = useState<RegistrationRow[] | null>(null)
  const [error,      setError]      = useState<string | null>(null)
  const [matchLabel, setMatchLabel] = useState<string>('')
  const [isPending,  startTransition] = useTransition()

  const lookup = () => {
    const input = query.trim()
    if (!input) {
      setError('Please enter your email address, phone number, or Registration ID.')
      return
    }

    const type = detectInputType(input)
    if (type === 'unknown') {
      setError('Could not recognise the input. Enter a valid email, 10-digit mobile number, or 6–8 character Registration ID (e.g. A1B2C3D4).')
      return
    }

    setError(null)
    setRows(null)
    setMatchLabel('')

    startTransition(async () => {
      const supabase = createClient()

      if (type === 'email') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('email', input.toLowerCase())
          .single()

        if (!profile) { setRows([]); return }
        setMatchLabel(profile.full_name)
        await fetchByProfileId(supabase, profile.id, setRows, setError)

      } else if (type === 'phone') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('phone_number', input)
          .single()

        if (!profile) { setRows([]); return }
        setMatchLabel(profile.full_name)
        await fetchByProfileId(supabase, profile.id, setRows, setError)

      } else {
        // Reg ID: search registrations whose UUID starts with the entered hex prefix
        const prefix = input.toLowerCase()
        const { data, error: regErr } = await supabase
          .from('registrations')
          .select(`
            id, status, reason,
            events ( name, age_group, event_date, slot_time, location )
          `)
          .like('id', `${prefix}%`)
          .order('status', { ascending: true })

        if (regErr) { setError('Could not load registrations. Please try again.'); return }
        setRows((data ?? []) as unknown as RegistrationRow[])
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Nav */}
      <header className="border-b border-white/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={14} /> Back to form
          </Link>
          <span className="text-slate-300">|</span>
          <p className="text-sm font-semibold text-slate-700">Registration Status</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Check your registration</h1>
          <p className="text-slate-500 text-sm">
            Enter your <strong>email address</strong>, <strong>10-digit mobile number</strong>, or{' '}
            <strong>Registration ID</strong> (shown on your receipt).
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
              placeholder="Email, phone number, or Reg ID (e.g. A1B2C3D4)"
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              onClick={lookup}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              {isPending ? 'Searching…' : <><Search size={15} /> Look up</>}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Your Registration ID is the 8-character code (e.g. <span className="font-mono font-semibold">A1B2C3D4</span>) shown at the top of your registration receipt.
          </p>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </div>

        {/* Results */}
        {rows !== null && (
          rows.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-slate-600">No registrations found</p>
              <p className="text-sm mt-1">
                Double-check your details or{' '}
                <Link href="/" className="text-orange-500 hover:underline">register here</Link>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {rows.length} registration{rows.length !== 1 ? 's' : ''} found
                  {matchLabel && <> for <strong className="text-slate-700">{matchLabel}</strong></>}
                </p>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <Info size={15} className="shrink-0 mt-0.5 text-amber-500" />
                <p>
                  Registrations are subject to change. The organizing committee may update event details,
                  move registrations to the waitlist, or cancel them based on capacity or other factors.
                  Please check back here for the latest status before the event.
                </p>
              </div>

              {rows.map(reg => {
                const cfg  = STATUS_CONFIG[reg.status]
                const Icon = cfg.icon
                const evt  = reg.events
                return (
                  <div key={reg.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${reg.status !== 'confirmed' ? 'border-slate-200' : 'border-green-200'}`}>
                    {/* Status bar */}
                    <div className={`flex items-center gap-3 px-5 py-3 border-b ${cfg.cls}`}>
                      <Icon size={16} className="shrink-0" />
                      <span className="text-sm font-semibold">{cfg.label}</span>
                      <span className="ml-auto font-mono text-xs opacity-60">#{reg.id.slice(0, 8).toUpperCase()}</span>
                    </div>

                    {/* Event detail */}
                    <div className="px-5 py-4 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-800">{evt.name}</p>
                          <p className="text-xs text-slate-400 capitalize mt-0.5">{evt.age_group.replace('_', ' ')}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${cfg.badge}`}>
                          {reg.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                        {evt.event_date && (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(evt.event_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {evt.slot_time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          {evt.location}
                        </span>
                      </div>

                      {/* Reason for waitlist / cancellation */}
                      {reg.reason && (
                        <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${reg.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                          <span className="font-semibold mr-1">
                            {reg.status === 'cancelled' ? 'Reason:' : 'Note:'}
                          </span>
                          {reg.reason}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </main>
    </div>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────
async function fetchByProfileId(
  supabase: ReturnType<typeof createClient>,
  profileId: string,
  setRows: (r: RegistrationRow[]) => void,
  setError: (e: string) => void,
) {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id, status, reason,
      events ( name, age_group, event_date, slot_time, location )
    `)
    .eq('profile_id', profileId)
    .order('status', { ascending: true })

  if (error) { setError('Could not load registrations. Please try again.'); return }
  setRows((data ?? []) as unknown as RegistrationRow[])
}
