'use client'

import { useState, useTransition, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { registrationSchema, type RegistrationFormData } from '@/lib/validations'
import { registerForEvents } from '@/actions/register'
import type { Event } from '@/types/database'
import type { SiteContent } from '@/lib/content'
import {
  CheckCircle, AlertCircle, Loader2, Calendar, User, Home, Phone, Mail,
  ExternalLink, FileText, Lock, Clock, Users, Check,
} from 'lucide-react'
import Link from 'next/link'
import type { RegistrationSummary } from '@/actions/register'

// ── Registration window constants ─────────────────────────────────────────────
const COMPETITIVE_DEADLINE  = new Date('2026-07-12T00:00:00') // closes end-of-day July 11
const CULTURAL_OPEN_DATE    = new Date('2026-07-13T00:00:00') // opens July 13

const AGE_GROUP_COLORS: Record<string, string> = {
  children: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  teens:    'bg-blue-100   text-blue-800   border-blue-200',
  adults:   'bg-green-100  text-green-800  border-green-200',
  seniors:  'bg-purple-100 text-purple-800 border-purple-200',
  all:      'bg-orange-100 text-orange-800 border-orange-200',
}

const TOWERS = Array.from({ length: 16 }, (_, i) => `Tower ${i + 1}`)

interface Props {
  events: Event[]
  site: SiteContent
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000)
}

export default function RegistrationForm({ events, site }: Props) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult]         = useState<{
    success: boolean; message: string; detail?: string; registrations?: RegistrationSummary[]
  } | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [fieldErrors, setFieldErrors]       = useState<Record<string, string>>({})
  const [submittedVals, setSubmittedVals]   = useState<Partial<RegistrationFormData>>({})

  const { register, getValues, formState: { errors }, reset } = useForm<RegistrationFormData>({
    defaultValues: { event_ids: [], team_name: '' },
  })

  // ── Window state ─────────────────────────────────────────────────────────
  const today               = useMemo(() => new Date(), [])
  const isCompetitiveClosed  = today >= COMPETITIVE_DEADLINE
  const isCulturalNotYetOpen = today < CULTURAL_OPEN_DATE
  const daysToDeadline      = daysUntil(COMPETITIVE_DEADLINE)
  const daysToOpen          = daysUntil(CULTURAL_OPEN_DATE)

  // ── Split and sort events ────────────────────────────────────────────────
  // Sort within each bucket: by event_date then alphabetically by name
  const sortByDateName = (a: Event, b: Event) => {
    const da = (a as any).event_date ?? '9999'
    const db = (b as any).event_date ?? '9999'
    if (da !== db) return da.localeCompare(db)
    return a.name.localeCompare(b.name)
  }

  const competitiveEvents = useMemo(() =>
    events.filter(e => (e as any).registration_type !== 'cultural').sort(sortByDateName),
    [events]
  )
  const culturalEvents = useMemo(() =>
    events.filter(e => (e as any).registration_type === 'cultural').sort(sortByDateName),
    [events]
  )

  // ── Team event detection ─────────────────────────────────────────────────
  const eventMap = useMemo(() => Object.fromEntries(events.map(e => [e.id, e])), [events])
  const hasTeamEvent = useMemo(() =>
    selectedEvents.some(id => (eventMap[id] as any)?.is_team === true),
    [selectedEvents, eventMap]
  )

  // ── Toggle ───────────────────────────────────────────────────────────────
  const toggleEvent = (id: string, disabled: boolean) => {
    if (disabled) return
    setSelectedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  // ── PDF receipt ──────────────────────────────────────────────────────────
  const downloadReceiptPDF = (regs: RegistrationSummary[]) => {
    const vals = submittedVals
    const now  = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    const rows = regs.map(r => `
      <tr>
        <td class="mono">${r.id.slice(0, 8).toUpperCase()}</td>
        <td>${r.event_name}<br/><small>${r.age_group}</small></td>
        <td>${r.event_date ? new Date(r.event_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
        <td>${r.slot_time}</td>
        <td>${r.location}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Meridian Park — Registration Receipt</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Arial,sans-serif; font-size:12px; color:#1e293b; padding:32px; }
    .header { display:flex; align-items:center; gap:14px; margin-bottom:20px; }
    .logo { width:44px; height:44px; }
    h1 { font-size:18px; font-weight:700; }
    .sub { font-size:11px; color:#64748b; }
    .badge { display:inline-block; background:#dcfce7; color:#16a34a; font-size:11px;
             font-weight:600; padding:3px 10px; border-radius:20px; margin:12px 0 16px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:20px;
                 background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
    .info-item label { display:block; font-size:10px; color:#94a3b8; text-transform:uppercase;
                       letter-spacing:.05em; margin-bottom:2px; }
    .info-item span { font-weight:600; }
    table { width:100%; border-collapse:collapse; }
    th { background:#f1f5f9; text-align:left; padding:7px 10px; font-size:10px;
         text-transform:uppercase; letter-spacing:.05em; border-bottom:2px solid #e2e8f0; }
    td { padding:8px 10px; border-bottom:1px solid #f1f5f9; vertical-align:top; }
    tr:nth-child(even) td { background:#fafafa; }
    .mono { font-family:monospace; font-weight:700; font-size:13px; color:#0f172a; }
    small { display:block; color:#64748b; font-size:10px; text-transform:capitalize; }
    .disclaimer { margin-top:20px; background:#fffbeb; border:1px solid #fcd34d; border-radius:8px;
                  padding:10px 12px; font-size:10px; color:#92400e; line-height:1.6; }
    .disclaimer strong { font-weight:700; }
    .footer { margin-top:16px; padding-top:12px; border-top:1px solid #e2e8f0;
              font-size:10px; color:#94a3b8; display:flex; justify-content:space-between; }
    @media print { body { padding:16px; } }
  </style>
</head>
<body>
  <div class="header">
    <img class="logo" src="/mplogo.png" alt="MP"/>
    <div>
      <h1>Meridian Park — Registration Receipt</h1>
      <p class="sub">Independence Day Celebrations 2026 &nbsp;·&nbsp; Generated ${now}</p>
    </div>
  </div>
  <span class="badge">✓ Registration Confirmed</span>
  <div class="info-grid">
    <div class="info-item"><label>Name</label><span>${vals.full_name ?? ''}</span></div>
    <div class="info-item"><label>Email</label><span>${vals.email ?? ''}</span></div>
    <div class="info-item"><label>Tower / Apartment</label><span>${vals.tower ?? ''} / ${vals.apartment_number ?? ''}</span></div>
    <div class="info-item"><label>Phone</label><span>+91 ${vals.phone_number ?? ''}</span></div>
    ${vals.team_name ? `<div class="info-item" style="grid-column:1/-1"><label>Team Name</label><span>${vals.team_name}</span></div>` : ''}
  </div>
  <table>
    <thead><tr><th>Reg ID</th><th>Event</th><th>Date</th><th>Time</th><th>Venue</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="disclaimer">
    ⚠️ <strong>This registration is tentative.</strong> Event details, timings, and venues are subject to
    change at the discretion of the organizing committee. Your registration may be moved to the waitlist or
    cancelled based on capacity or other factors. For the latest status, visit the
    <strong> Check Registration Status</strong> page on the society portal using your email, phone number, or Registration ID.
  </div>
  <div class="footer">
    <span>Keep this receipt. Use your Reg ID, email, or phone to check status at the society portal.</span>
    <span>Meridian Park · Independence Day 2026</span>
  </div>
  <script>window.onload = () => { window.print() }</script>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close() }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmitClick = () => {
    const raw    = { ...getValues(), event_ids: selectedEvents }
    const parsed = registrationSchema.safeParse(raw)
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        errs[key] = (msgs as string[])[0] ?? 'Invalid'
      }
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    const snapshot = getValues()
    startTransition(async () => {
      setResult(null)
      const res = await registerForEvents(parsed.data)
      setResult(res)
      if (res.success) {
        setSubmittedVals({ ...snapshot, event_ids: selectedEvents })
        reset()
        setSelectedEvents([])
      }
    })
  }

  // ── Flat event list ───────────────────────────────────────────────────────
  const renderFlatList = (
    evts: Event[],
    disabled: boolean,
    reason?: 'closed' | 'soon',
  ) => (
    <div className="space-y-2">
      {evts.map(event => {
        const isSelected = selectedEvents.includes(event.id)
        const isTeam     = (event as any).is_team === true

        return (
          <button
            key={event.id}
            type="button"
            onClick={() => toggleEvent(event.id, disabled)}
            disabled={disabled}
            className={`
              w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
              ${disabled
                ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-55'
                : isSelected
                ? 'border-orange-400 bg-orange-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40'}
            `}
          >
            {/* Circle indicator */}
            <div className={`
              shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${isSelected && !disabled
                ? 'border-orange-500 bg-orange-500'
                : disabled && reason === 'closed'
                ? 'border-slate-200 bg-slate-100'
                : disabled && reason === 'soon'
                ? 'border-blue-200 bg-blue-50'
                : 'border-slate-300 bg-white'}
            `}>
              {isSelected && !disabled   && <Check size={11} className="text-white" />}
              {disabled && reason === 'closed' && <Lock size={9} className="text-slate-300" />}
              {disabled && reason === 'soon'   && <Clock size={9} className="text-blue-300" />}
            </div>

            {/* Event info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${disabled ? 'text-slate-400' : isSelected ? 'text-orange-900' : 'text-slate-800'}`}>
                  {event.name}
                </span>
                {isTeam && (
                  <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Users size={9} /> Team
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-400">
                <span>{event.slot_time}</span>
                <span>·</span>
                <span>{event.location}</span>
                <span>·</span>
                <span>{event.max_participants} spots</span>
              </div>
            </div>

            {/* Age group badge */}
            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border hidden sm:inline-flex
              ${AGE_GROUP_COLORS[event.age_group] ?? AGE_GROUP_COLORS.all}`}>
              {event.age_group}
            </span>
          </button>
        )
      })}
    </div>
  )

  return (
    <form onSubmit={e => e.preventDefault()} className="space-y-8">

      {/* ── Personal Details ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User size={20} className="text-orange-500" />
          {site.form_section_personal}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input {...register('full_name')} placeholder="Rajesh Kumar" className="input-field" />
            {(fieldErrors.full_name || errors.full_name) && <FieldError message={fieldErrors.full_name ?? errors.full_name!.message!} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Home size={14} className="inline mr-1 text-slate-500" />
              Tower <span className="text-red-500">*</span>
            </label>
            <select {...register('tower')} className="input-field">
              <option value="">Select tower…</option>
              {TOWERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {(fieldErrors.tower || errors.tower) && <FieldError message={fieldErrors.tower ?? errors.tower!.message!} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Apartment Number <span className="text-red-500">*</span>
            </label>
            <input {...register('apartment_number')} placeholder="50123" maxLength={6} className="input-field" />
            <p className="text-xs text-slate-400 mt-1">5 or 6 digits, starting with 5 or 6</p>
            {(fieldErrors.apartment_number || errors.apartment_number) && <FieldError message={fieldErrors.apartment_number ?? errors.apartment_number!.message!} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Phone size={14} className="inline mr-1 text-slate-500" />
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 rounded-l-lg bg-slate-50 text-slate-500 text-sm">+91</span>
              <input {...register('phone_number')} placeholder="9876543210" maxLength={10} className="input-field rounded-l-none" />
            </div>
            {(fieldErrors.phone_number || errors.phone_number) && <FieldError message={fieldErrors.phone_number ?? errors.phone_number!.message!} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Mail size={14} className="inline mr-1 text-slate-500" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input {...register('email')} type="email" placeholder="rajesh@example.com" className="input-field" />
            {(fieldErrors.email || errors.email) && <FieldError message={fieldErrors.email ?? errors.email!.message!} />}
          </div>

        </div>
      </section>

      {/* ── Event Selection ──────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-orange-500" />
            {site.form_section_events}
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-2">{site.form_events_hint}</p>
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <Calendar size={15} className="shrink-0 mt-0.5 text-amber-500" />
            <p>
              All events will be held on <strong>weekends (Saturdays &amp; Sundays)</strong> between{' '}
              <strong>18 July and 9 August 2026</strong>. The exact schedule for each event will be announced
              closer to the date.
            </p>
          </div>
        </div>

        {/* ── COMPETITIVE ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className={`px-5 py-3 flex flex-wrap items-center gap-3 border-b ${isCompetitiveClosed ? 'bg-slate-100 border-slate-200' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex-1">
              <p className="font-bold text-slate-800">🏆 Competitive Events</p>
              <p className="text-xs text-slate-500 mt-0.5">Sports Solo · Sports Group · Art Solo</p>
            </div>
            {isCompetitiveClosed
              ? <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-100 border border-red-200 px-3 py-1 rounded-full">
                  <Lock size={11} /> Registration Closed
                </span>
              : <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                  <Clock size={11} />
                  {daysToDeadline > 0
                    ? `Closes in ${daysToDeadline} day${daysToDeadline !== 1 ? 's' : ''} · July 11, 2026`
                    : 'Closes today · July 11, 2026'}
                </span>
            }
          </div>

          <div className="p-4">
            {isCompetitiveClosed && (
              <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                <Lock size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm">Registration for competitive events closed on <strong>July 11, 2026</strong>.</p>
              </div>
            )}
            {competitiveEvents.length === 0
              ? <p className="text-sm text-slate-400 py-8 text-center">No competitive events available.</p>
              : renderFlatList(competitiveEvents, isCompetitiveClosed, 'closed')
            }
          </div>
        </div>

        {/* ── CULTURAL ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className={`px-5 py-3 flex flex-wrap items-center gap-3 border-b ${isCulturalNotYetOpen ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
            <div className="flex-1">
              <p className="font-bold text-slate-800">🎭 Cultural Events</p>
              <p className="text-xs text-slate-500 mt-0.5">Dance · Singing · Games</p>
            </div>
            {isCulturalNotYetOpen
              ? <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1 rounded-full">
                  <Clock size={11} />
                  {daysToOpen > 0
                    ? `Opens in ${daysToOpen} day${daysToOpen !== 1 ? 's' : ''} · July 13, 2026`
                    : 'Opens today · July 13, 2026'}
                </span>
              : <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">
                  <CheckCircle size={11} /> Registration Open
                </span>
            }
          </div>

          <div className="p-4">
            {isCulturalNotYetOpen && (
              <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
                <Clock size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm">Cultural event registration opens on <strong>July 13, 2026</strong> and runs for two weeks.</p>
              </div>
            )}
            {culturalEvents.length === 0
              ? <p className="text-sm text-slate-400 py-8 text-center">No cultural events available.</p>
              : renderFlatList(culturalEvents, isCulturalNotYetOpen, 'soon')
            }
          </div>
        </div>
      </section>

      {/* ── Team Name ────────────────────────────────────────────────────── */}
      {hasTeamEvent && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h3 className="font-semibold text-blue-900">Team Registration</h3>
          </div>
          <p className="text-sm text-blue-700">
            You&apos;ve selected one or more team / group events. Please enter your team name below.
          </p>
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Team Name <span className="text-xs font-normal text-blue-500">(optional)</span>
            </label>
            <input
              {...register('team_name')}
              placeholder="e.g. Tower 5 Blazers"
              maxLength={80}
              className="input-field bg-white"
            />
            <p className="text-xs text-blue-600 mt-1.5">Please ensure your team is formed before registering.</p>
            {(fieldErrors.team_name || errors.team_name) && <FieldError message={fieldErrors.team_name ?? errors.team_name!.message!} />}
          </div>
        </section>
      )}

      {/* ── Hint ─────────────────────────────────────────────────────────── */}
      {events.length > 0 && selectedEvents.length === 0 && (
        <p className="text-sm text-slate-400 flex items-center gap-1.5">
          <AlertCircle size={14} /> Select at least one event to register.
        </p>
      )}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {result && !result.success && (
        <div className="flex items-start gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{result.message}</p>
            {result.detail && <p className="text-xs mt-1 opacity-75 font-mono">{result.detail}</p>}
          </div>
        </div>
      )}

      {/* ── Success receipt ───────────────────────────────────────────────── */}
      {result?.success && result.registrations && result.registrations.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-green-100 border-b border-green-200">
            <CheckCircle size={22} className="text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-green-800">{result.message}</p>
              <p className="text-xs text-green-600 mt-0.5">Save your registration IDs — you&apos;ll need them to check your status.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-50 border-b border-green-200 text-xs text-green-700 uppercase tracking-wide">
                  <th className="px-4 py-2 text-left font-semibold">Reg ID</th>
                  <th className="px-4 py-2 text-left font-semibold">Event</th>
                  {submittedVals.team_name && <th className="px-4 py-2 text-left font-semibold">Team</th>}
                  <th className="px-4 py-2 text-left font-semibold">Time</th>
                  <th className="px-4 py-2 text-left font-semibold">Venue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {result.registrations.map(r => (
                  <tr key={r.id} className="hover:bg-green-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-green-800 font-semibold whitespace-nowrap">
                      {r.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{r.event_name}</p>
                      <p className="text-xs text-slate-400 capitalize">{r.age_group}</p>
                    </td>
                    {submittedVals.team_name && (
                      <td className="px-4 py-3 text-xs text-slate-600">{submittedVals.team_name}</td>
                    )}
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{r.slot_time}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{r.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Disclaimer */}
          <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-start gap-2 text-xs text-amber-800">
            <AlertCircle size={13} className="shrink-0 mt-0.5 text-amber-500" />
            <p>
              <strong>This registration is tentative.</strong> Event details, timings, and venues are subject
              to change at the discretion of the organizing committee. Your registration may be moved to the
              waitlist or cancelled based on capacity or other factors. For the latest status, use the{' '}
              <Link href="/status" className="underline underline-offset-2 font-semibold hover:text-amber-900">
                Check Registration Status
              </Link>{' '}
              page.
            </p>
          </div>

          <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <button
              type="button"
              onClick={() => downloadReceiptPDF(result!.registrations!)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
            >
              <FileText size={12} /> Download Receipt (PDF)
            </button>
            <Link href="/status" className="flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 underline underline-offset-2">
              Check registration status <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleSubmitClick}
        disabled={isPending || events.length === 0}
        className="
          w-full py-3.5 px-6 rounded-xl font-semibold text-white
          bg-gradient-to-r from-orange-500 to-orange-600
          hover:from-orange-600 hover:to-orange-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150 shadow-md hover:shadow-lg
          flex items-center justify-center gap-2
        "
      >
        {isPending
          ? <><Loader2 size={18} className="animate-spin" /> Registering…</>
          : `Register for ${selectedEvents.length || 0} Event${selectedEvents.length !== 1 ? 's' : ''}`
        }
      </button>

    </form>
  )
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle size={12} /> {message}
    </p>
  )
}
