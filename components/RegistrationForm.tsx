'use client'

import { useState, useTransition, useMemo, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { registrationSchema, teamMemberSchema, type RegistrationFormData, type TeamMember } from '@/lib/validations'
import { registerForEvents } from '@/actions/register'
import type { Event } from '@/types/database'
import type { SiteContent, RegistrationStatus } from '@/lib/content'
import {
  CheckCircle, AlertCircle, Loader2, Calendar, CalendarDays, User, Home, Phone, Mail,
  ExternalLink, FileText, Lock, Clock, Users, Check, IndianRupee, X, ChevronDown,
  Eye, EyeOff, Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import type { RegistrationSummary } from '@/actions/register'
import { checkCulturalPassword } from '@/actions/culturalAccess'

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

const B5_TOWERS = Array.from({ length: 10 }, (_, i) => `Building 5 – Tower ${i + 1}`)
const B6_TOWERS = Array.from({ length: 6 },  (_, i) => `Building 6 – Tower ${i + 1}`)

interface Props {
  events: Event[]
  site: SiteContent
  culturalStatus: RegistrationStatus
  competitiveStatus: RegistrationStatus
  registrationCounts: Record<string, number>
  culturalPasswordRequired: boolean
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000)
}

// Format event date with day name. If slot_time spans two days (e.g. badminton
// "25–26 July"), derive both day names from event_date + event_date+1.
function formatEventDate(eventDate: string | null, slotTime: string): string | null {
  if (!eventDate && !slotTime) return null
  if (!eventDate) return slotTime

  const d = new Date(eventDate + 'T00:00:00')
  const day = d.toLocaleDateString('en-IN', { weekday: 'short' })  // "Sat"

  if (slotTime) {
    // Two-day span — show both day names
    const d2 = new Date(d); d2.setDate(d.getDate() + 1)
    const day2 = d2.toLocaleDateString('en-IN', { weekday: 'short' })
    return `${day} – ${day2}, ${slotTime}`
  }

  return `${day}, ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

const SESSION_KEY = 'cultural_unlocked'

function SlotBadge({ count, max }: { count: number; max: number }) {
  const waitlistCap = Math.floor(max * 1.5)
  const remaining   = max - count
  const isFull      = count >= waitlistCap
  const isWaitlist  = !isFull && count >= max
  const isAlmostFull = !isWaitlist && !isFull && remaining <= Math.ceil(max * 0.2)

  if (isFull) {
    return (
      <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
        Full
      </span>
    )
  }
  if (isWaitlist) {
    const waitRemaining = waitlistCap - count
    return (
      <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
        Waitlist · {waitRemaining} left
      </span>
    )
  }
  if (isAlmostFull) {
    return (
      <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
        {remaining} slot{remaining !== 1 ? 's' : ''} left
      </span>
    )
  }
  return (
    <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
      {remaining} slot{remaining !== 1 ? 's' : ''} left
    </span>
  )
}

export default function RegistrationForm({ events, site, culturalStatus, competitiveStatus, registrationCounts, culturalPasswordRequired }: Props) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult]         = useState<{
    success: boolean; message: string; detail?: string; registrations?: RegistrationSummary[]
  } | null>(null)
  const [selectedEvents, setSelectedEvents]     = useState<string[]>([])
  const [fieldErrors, setFieldErrors]           = useState<Record<string, string>>({})
  const [submittedVals, setSubmittedVals]       = useState<Partial<RegistrationFormData>>({})
  const [feeConsented, setFeeConsented]         = useState(false)
  const [showFeeModal, setShowFeeModal]         = useState(false)
  const [eventTeamDetails, setEventTeamDetails] = useState<Record<string, { team_name: string; members: TeamMember[] }>>({})
  const [openAccordions, setOpenAccordions]     = useState<Set<string>>(new Set())
  const [tmErrors, setTmErrors]                 = useState<Record<string, Record<number, Partial<Record<keyof TeamMember, string>>>>>({})
  const [culturalUnlocked, setCulturalUnlocked]   = useState(false)
  const [passwordInput, setPasswordInput]         = useState('')
  const [passwordError, setPasswordError]         = useState(false)
  const [showPassword, setShowPassword]           = useState(false)
  const [isCheckingPw, startPasswordTransition]   = useTransition()

  // Restore unlock from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1') {
      setCulturalUnlocked(true)
    }
  }, [])

  const unlockCultural = () => {
    startPasswordTransition(async () => {
      const ok = await checkCulturalPassword(passwordInput)
      if (ok) {
        setCulturalUnlocked(true)
        sessionStorage.setItem(SESSION_KEY, '1')
        setPasswordError(false)
      } else {
        setPasswordError(true)
      }
    })
  }

  const { register, getValues, formState: { errors }, reset } = useForm<RegistrationFormData>({
    defaultValues: { event_ids: [] },
    mode: 'onBlur',
  })

  // Pre-registered fields that need onChange stripping (must be stable — not inside JSX)
  const aptReg   = register('apartment_number', { validate: v => /^[56]\d{4,5}$/.test(v) || 'Apartment number must start with 5 or 6 (e.g. 50123)' })
  const phoneReg = register('phone_number',     { validate: v => /^[6-9]\d{9}$/.test(v) || 'Enter a valid 10-digit Indian mobile number (starts with 6–9)' })

  // ── Window state (driven by events.md toggles) ────────────────────────────
  const isCompetitiveLocked = competitiveStatus !== 'open'
  const isCulturalLocked    = culturalStatus !== 'open'

  // ── Sport group for sorting competitive events ────────────────────────────
  const sportGroup = (name: string) => {
    if (/toddlers race/i.test(name))        return '0-Toddlers'  // always first regardless of age suffix
    if (/^50m|^100m/i.test(name))           return '1-Running'
    if (/lemon spoon/i.test(name))          return '2-LemonSpoon'
    if (/^chess/i.test(name))               return '3-Chess'
    if (/badminton singles/i.test(name))    return '4-BadmintonSingles'
    if (/badminton doubles/i.test(name))    return '5-BadmintonDoubles'
    if (/badminton mixed/i.test(name))      return '6-BadmintonMixed'
    if (/table tennis singles/i.test(name)) return '7-TTSingles'
    if (/table tennis doubles/i.test(name)) return '8-TTDoubles'
    if (/table tennis mixed/i.test(name))   return '9-TTMixed'
    if (/treasure hunt/i.test(name))        return 'Z-Treasure'
    return 'M-' + name
  }

  // Extract the leading age number from a name like "Age 5 – 10" or "Age 15+"
  const leadingAge = (name: string): number => {
    const m = name.match(/age\s+(\d+)/i)
    return m ? parseInt(m[1], 10) : 0
  }

  const AGE_GROUP_ORDER: Record<string, number> = { children: 0, teens: 1, adults: 2, seniors: 3, all: 4 }

  const sortCompetitive = (a: Event, b: Event) => {
    const ga = sportGroup(a.name), gb = sportGroup(b.name)
    if (ga !== gb) return ga.localeCompare(gb)
    const ageDiff = (AGE_GROUP_ORDER[a.age_group] ?? 9) - (AGE_GROUP_ORDER[b.age_group] ?? 9)
    if (ageDiff !== 0) return ageDiff
    return leadingAge(a.name) - leadingAge(b.name)
  }

  const sortCultural = (a: Event, b: Event) =>
    (AGE_GROUP_ORDER[a.age_group] ?? 9) - (AGE_GROUP_ORDER[b.age_group] ?? 9)

  // ── Split events ──────────────────────────────────────────────────────────
  const competitiveEvents = useMemo(() =>
    events.filter(e => (e as any).registration_type !== 'cultural').sort(sortCompetitive),
    [events]
  )
  const culturalEvents = useMemo(() =>
    events.filter(e => (e as any).registration_type === 'cultural').sort(sortCultural),
    [events]
  )

  // ── Event map ────────────────────────────────────────────────────────────
  const eventMap = useMemo(() => Object.fromEntries(events.map(e => [e.id, e])), [events])

  // ── Toggle ───────────────────────────────────────────────────────────────
  const toggleEvent = (id: string, disabled: boolean) => {
    if (disabled) return
    if (!feeConsented) { setShowFeeModal(true); return }
    const isCurrentlySelected = selectedEvents.includes(id)
    setSelectedEvents(prev => isCurrentlySelected ? prev.filter(e => e !== id) : [...prev, id])
    if (isCurrentlySelected) {
      setOpenAccordions(prev => { const s = new Set(prev); s.delete(id); return s })
      setEventTeamDetails(prev => { const m = { ...prev }; delete m[id]; return m })
    } else if ((eventMap[id] as any)?.is_team) {
      setOpenAccordions(prev => new Set([...prev, id]))
    }
  }

  // ── Accordion toggle ──────────────────────────────────────────────────────
  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  // ── Team detail helpers (always use prev inside setters to avoid stale closure) ──
  const getTeamDetail = (eventId: string) =>
    eventTeamDetails[eventId] ?? { team_name: '', members: [] }

  const empty = { team_name: '', members: [] as TeamMember[] }

  const setTeamName = (eventId: string, name: string) =>
    setEventTeamDetails(prev => {
      const cur = prev[eventId] ?? empty
      return { ...prev, [eventId]: { ...cur, team_name: name } }
    })

  const addTeamMember = (eventId: string) =>
    setEventTeamDetails(prev => {
      const cur = prev[eventId] ?? empty
      return { ...prev, [eventId]: { ...cur, members: [...cur.members, { name: '', tower: '', apartment_number: '', phone_number: '' }] } }
    })

  const removeTeamMember = (eventId: string, idx: number) =>
    setEventTeamDetails(prev => {
      const cur = prev[eventId] ?? empty
      return { ...prev, [eventId]: { ...cur, members: cur.members.filter((_, i) => i !== idx) } }
    })

  const updateTeamMember = (eventId: string, idx: number, patch: Partial<TeamMember>) =>
    setEventTeamDetails(prev => {
      const cur = prev[eventId] ?? empty
      return { ...prev, [eventId]: { ...cur, members: cur.members.map((m, i) => i === idx ? { ...m, ...patch } : m) } }
    })

  // ── PDF receipt ──────────────────────────────────────────────────────────
  const downloadReceiptPDF = (regs: RegistrationSummary[]) => {
    const vals = submittedVals
    const now  = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    const rows = regs.map(r => `
      <tr>
        <td class="mono">${r.id.slice(0, 8).toUpperCase()}</td>
        <td><span class="${r.is_team ? 'team-tag' : 'solo-tag'}">${r.is_team ? 'Team' : 'Solo'}</span> ${r.event_name}<br/><small>${r.age_group}</small></td>
        <td>${r.team_name ? `<span class="team-name">${r.team_name}</span>` : '—'}</td>
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
    .solo-tag { font-size:9px; font-weight:700; background:#f1f5f9; color:#64748b; padding:1px 5px; border-radius:4px; }
    .team-tag  { font-size:9px; font-weight:700; background:#dbeafe; color:#1d4ed8; padding:1px 5px; border-radius:4px; }
    .team-name { font-size:10px; font-weight:600; color:#1d4ed8; }
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
  </div>
  <table>
    <thead><tr><th>Reg ID</th><th>Event</th><th>Team Name</th></tr></thead>
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
    // Step 1: validate per-event team members manually so we can show field-level errors
    const newTmErrors: typeof tmErrors = {}
    let hasTmError = false
    for (const [eventId, detail] of Object.entries(eventTeamDetails)) {
      newTmErrors[eventId] = {}
      for (let idx = 0; idx < detail.members.length; idx++) {
        const r = teamMemberSchema.safeParse(detail.members[idx])
        if (!r.success) {
          newTmErrors[eventId][idx] = Object.fromEntries(
            Object.entries(r.error.flatten().fieldErrors).map(([k, v]) => [k, (v as string[])[0]])
          ) as Partial<Record<keyof TeamMember, string>>
          hasTmError = true
        }
      }
    }
    setTmErrors(newTmErrors)
    if (hasTmError) return

    // Step 2: Zod validate everything else
    const hasTeamDetails = Object.values(eventTeamDetails).some(d => d.team_name || d.members.length > 0)
    const raw = {
      ...getValues(),
      event_ids: selectedEvents,
      event_team_details: hasTeamDetails ? eventTeamDetails : undefined,
    }
    const parsed = registrationSchema.safeParse(raw)
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        errs[key] = (msgs as string[])[0] ?? 'Invalid'
      }
      // event_ids error is shown inline
      if (parsed.error.flatten().fieldErrors.event_ids) {
        errs.event_ids = (parsed.error.flatten().fieldErrors.event_ids as string[])[0]
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
        setEventTeamDetails({})
        setOpenAccordions(new Set())
      }
    })
  }

  // ── Flat event list with per-event team member accordions ────────────────
  const renderFlatList = (
    evts: Event[],
    disabled: boolean,
    reason?: 'closed' | 'soon',
    showSlots = false,
  ) => (
    <div className="space-y-2">
      {evts.map(event => {
        const isSelected    = selectedEvents.includes(event.id)
        const isTeam        = (event as any).is_team === true
        const detail        = getTeamDetail(event.id)
        const accordionOpen = openAccordions.has(event.id)
        const maxPax        = (event as any).max_participants as number ?? 9999
        const count         = registrationCounts[event.id] ?? 0
        const isFull        = showSlots && count >= Math.floor(maxPax * 1.5)
        const effectiveDisabled = disabled || isFull

        return (
          <div key={event.id} className="space-y-1">
            {/* Event card */}
            <button
              type="button"
              onClick={() => toggleEvent(event.id, effectiveDisabled)}
              disabled={effectiveDisabled}
              className={`
                w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
                ${effectiveDisabled
                  ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-55'
                  : isSelected
                  ? 'border-orange-400 bg-orange-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40'}
              `}
            >
              {/* Circle indicator */}
              <div className={`
                shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${isSelected && !effectiveDisabled
                  ? 'border-orange-500 bg-orange-500'
                  : effectiveDisabled && reason === 'closed'
                  ? 'border-slate-200 bg-slate-100'
                  : effectiveDisabled && reason === 'soon'
                  ? 'border-blue-200 bg-blue-50'
                  : isFull
                  ? 'border-red-200 bg-red-50'
                  : 'border-slate-300 bg-white'}
              `}>
                {isSelected && !effectiveDisabled  && <Check size={11} className="text-white" />}
                {!isFull && disabled && reason === 'closed' && <Lock  size={9}  className="text-slate-300" />}
                {!isFull && disabled && reason === 'soon'   && <Clock size={9}  className="text-blue-300" />}
                {isFull                                      && <Lock  size={9}  className="text-red-300" />}
              </div>

              {/* Event info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${effectiveDisabled ? 'text-slate-400' : isSelected ? 'text-orange-900' : 'text-slate-800'}`}>
                    {event.name}
                  </span>
                  {isTeam && (
                    <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Users size={9} /> Team
                    </span>
                  )}
                </div>
                {/* Date pill */}
                {formatEventDate((event as any).event_date, (event as any).slot_time) && (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-0.5 rounded-full border
                    ${effectiveDisabled
                      ? 'text-slate-300 bg-slate-50 border-slate-100'
                      : isSelected
                      ? 'text-orange-700 bg-orange-50 border-orange-200'
                      : 'text-indigo-600 bg-indigo-50 border-indigo-100'
                    }`}>
                    <CalendarDays size={10} className="shrink-0" />
                    {formatEventDate((event as any).event_date, (event as any).slot_time)}
                  </span>
                )}
              </div>

              {/* Slot badge (for events with limited slots) + Age group badge */}
              {showSlots && maxPax < 500 && (
                <SlotBadge count={count} max={maxPax} />
              )}
              <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border hidden sm:inline-flex
                ${AGE_GROUP_COLORS[event.age_group] ?? AGE_GROUP_COLORS.all}`}>
                {event.age_group}
              </span>
            </button>

            {/* Per-event team member accordion (only when selected + is_team + not disabled) */}
            {isSelected && isTeam && !effectiveDisabled && (
              <div className="ml-6 rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
                {/* Accordion header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(event.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-blue-600" />
                    <span>
                      {detail.team_name ? `"${detail.team_name}"` : 'Team Details'}
                      {detail.members.length > 0 ? ` · ${detail.members.length} member${detail.members.length !== 1 ? 's' : ''}` : ''}
                    </span>
                  </div>
                  <ChevronDown size={15} className={`transition-transform text-blue-500 ${accordionOpen ? 'rotate-180' : ''}`} />
                </button>

                {accordionOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-blue-100 space-y-3">
                    {/* Team Name for this event */}
                    <div className="mt-2">
                      <label className="block text-xs font-semibold text-blue-800 mb-1">
                        Team / Group Name <span className="font-normal text-blue-500">(optional)</span>
                      </label>
                      <input
                        value={detail.team_name}
                        onChange={e => setTeamName(event.id, e.target.value)}
                        placeholder="e.g. Tower 5 Blazers"
                        maxLength={80}
                        className="input-field bg-white text-sm"
                      />
                    </div>

                    <p className="text-xs text-blue-600">Add details for each team member <em>other than yourself</em>. This helps volunteers track participation fees.</p>

                    {detail.members.map((member, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-blue-700">Member {idx + 1}</span>
                          <button type="button" onClick={() => removeTeamMember(event.id, idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                            <input
                              value={member.name}
                              onChange={e => updateTeamMember(event.id, idx, { name: e.target.value })}
                              placeholder="Priya Sharma"
                              className="input-field text-sm"
                            />
                            {tmErrors[event.id]?.[idx]?.name && <p className="text-xs text-red-500 mt-1">{tmErrors[event.id][idx].name}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Building &amp; Tower *</label>
                            <select
                              value={member.tower}
                              onChange={e => updateTeamMember(event.id, idx, { tower: e.target.value })}
                              className="input-field text-sm"
                            >
                              <option value="">Select tower…</option>
                              <optgroup label="Building 5 (Tower 1 – 10)">
                                {B5_TOWERS.map(t => <option key={t} value={t}>{t}</option>)}
                              </optgroup>
                              <optgroup label="Building 6 (Tower 1 – 6)">
                                {B6_TOWERS.map(t => <option key={t} value={t}>{t}</option>)}
                              </optgroup>
                            </select>
                            {tmErrors[event.id]?.[idx]?.tower && <p className="text-xs text-red-500 mt-1">{tmErrors[event.id][idx].tower}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Apartment Number *</label>
                            <input
                              value={member.apartment_number}
                              onChange={e => updateTeamMember(event.id, idx, { apartment_number: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                              placeholder="50123"
                              inputMode="numeric"
                              maxLength={6}
                              className="input-field text-sm"
                            />
                            {tmErrors[event.id]?.[idx]?.apartment_number && <p className="text-xs text-red-500 mt-1">{tmErrors[event.id][idx].apartment_number}</p>}
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number *</label>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 rounded-l-lg bg-slate-50 text-slate-500 text-sm">+91</span>
                              <input
                                value={member.phone_number}
                                onChange={e => updateTeamMember(event.id, idx, { phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                placeholder="9876543210"
                                inputMode="numeric"
                                maxLength={10}
                                className="input-field rounded-l-none text-sm flex-1"
                              />
                            </div>
                            {tmErrors[event.id]?.[idx]?.phone_number && <p className="text-xs text-red-500 mt-1">{tmErrors[event.id][idx].phone_number}</p>}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addTeamMember(event.id)}
                      className="text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      + Add Member
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
            <input
              {...register('full_name', {
                minLength: { value: 2, message: 'Full name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Name is too long' },
                pattern:   { value: /^[a-zA-Z\s.'-]+$/, message: "Name can only contain letters, spaces, and . ' -" },
              })}
              placeholder="Rajesh Kumar"
              className="input-field"
            />
            {(fieldErrors.full_name || errors.full_name) && <FieldError message={fieldErrors.full_name ?? errors.full_name!.message!} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Home size={14} className="inline mr-1 text-slate-500" />
              Building &amp; Tower <span className="text-red-500">*</span>
            </label>
            <select
              {...register('tower', {
                validate: v => /^(Building 5 – Tower (10|[1-9])|Building 6 – Tower [1-6])$/.test(v) || 'Select a valid tower',
              })}
              className="input-field"
            >
              <option value="">Select building &amp; tower…</option>
              <optgroup label="Building 5 (Tower 1 – 10)">
                {B5_TOWERS.map(t => <option key={t} value={t}>{t}</option>)}
              </optgroup>
              <optgroup label="Building 6 (Tower 1 – 6)">
                {B6_TOWERS.map(t => <option key={t} value={t}>{t}</option>)}
              </optgroup>
            </select>
            {(fieldErrors.tower || errors.tower) && <FieldError message={fieldErrors.tower ?? errors.tower!.message!} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Apartment Number <span className="text-red-500">*</span>
            </label>
            <input
              {...aptReg}
              onChange={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); aptReg.onChange(e) }}
              placeholder="e.g. 50123 or 601234"
              inputMode="numeric"
              maxLength={6}
              className="input-field"
            />
            <p className="text-xs text-slate-400 mt-1">Starts with 5 or 6 · 5 or 6 digits total (e.g. 50123, 601234)</p>
            {(fieldErrors.apartment_number || errors.apartment_number) && <FieldError message={fieldErrors.apartment_number ?? errors.apartment_number!.message!} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Phone size={14} className="inline mr-1 text-slate-500" />
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 rounded-l-lg bg-slate-50 text-slate-500 text-sm">+91</span>
              <input
                {...phoneReg}
                onChange={e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); phoneReg.onChange(e) }}
                placeholder="9876543210"
                inputMode="numeric"
                maxLength={10}
                className="input-field rounded-l-none"
              />
            </div>
            {(fieldErrors.phone_number || errors.phone_number) && <FieldError message={fieldErrors.phone_number ?? errors.phone_number!.message!} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Mail size={14} className="inline mr-1 text-slate-500" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email', {
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                maxLength: { value: 200, message: 'Email too long' },
              })}
              type="email"
              placeholder="rajesh@example.com"
              className="input-field"
            />
            {(fieldErrors.email || errors.email) && <FieldError message={fieldErrors.email ?? errors.email!.message!} />}
          </div>

        </div>
      </section>

      {/* ── Fee Consent Modal ────────────────────────────────────────────── */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-orange-50 border-b border-orange-200 px-6 py-4 flex items-center gap-3">
              <IndianRupee size={20} className="text-orange-600 shrink-0" />
              <h2 className="font-bold text-orange-900 text-lg">Participation Fee</h2>
              <button onClick={() => setShowFeeModal(false)} className="ml-auto text-orange-400 hover:text-orange-700">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm text-slate-700">
              <p className="text-base font-semibold text-slate-800">₹ 150 per participant</p>
              <p>
                A participation fee of <strong>₹ 150 per person</strong> applies, irrespective of the number
                of activities an individual registers for.
              </p>
              <p>
                A <strong>volunteer from the cultural committee</strong> will contact you with payment details
                once the registration window closes. You do not need to pay now.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-xs">
                <strong>Note:</strong> Your registration will remain tentative until payment is confirmed.
                The organizing committee reserves the right to cancel unpaid registrations.
              </div>
              <p className="text-[10px] leading-relaxed text-slate-400">
                <strong className="text-slate-500">Disclaimer:</strong> By proceeding, you acknowledge that Meridian Park Management and the Organizing Committee shall not be held liable for any injury, loss, damage, or risk — including medical emergencies — arising during or in connection with any event. Participation is entirely at your own risk. Participants with medical conditions are advised to consult a physician before registering.
              </p>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => { setFeeConsented(true); setShowFeeModal(false) }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors"
              >
                I Agree — Proceed to Select Events
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Selection ──────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-orange-500" />
            {site.form_section_events}
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-2">{site.form_events_hint}</p>
        </div>

        {/* Fee consent gate */}
        {!feeConsented && (
          <button
            type="button"
            onClick={() => setShowFeeModal(true)}
            className="w-full flex items-center gap-4 p-4 bg-orange-50 border-2 border-orange-200 border-dashed rounded-2xl hover:border-orange-400 hover:bg-orange-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-xl flex items-center justify-center shrink-0 transition-colors">
              <IndianRupee size={20} className="text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-orange-900 text-sm">Review &amp; Accept Participation Fee</p>
              <p className="text-xs text-orange-700 mt-0.5">₹ 150 per participant · Click to read terms and unlock event selection</p>
            </div>
            <Lock size={16} className="ml-auto text-orange-400 shrink-0" />
          </button>
        )}

        {feeConsented && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            <CheckCircle size={15} className="text-green-600 shrink-0" />
            <span>Participation fee accepted — ₹ 150 per participant. A volunteer will contact you with payment details after the registration window closes.</span>
          </div>
        )}

        {/* ── COMPETITIVE ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className={`px-5 py-3 flex flex-wrap items-center gap-3 border-b ${
            competitiveStatus === 'open'    ? 'bg-amber-50 border-amber-100' :
            competitiveStatus === 'closed'  ? 'bg-slate-100 border-slate-200' :
                                              'bg-blue-50 border-blue-100'
          }`}>
            <div className="flex-1">
              <p className="font-bold text-slate-800">🏆 Competitive Events</p>
              <p className="text-xs text-slate-500 mt-0.5">Running · Chess · Badminton · Table Tennis · Treasure Hunt</p>
            </div>
            {competitiveStatus === 'open' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                <CheckCircle size={11} /> Registration Open
              </span>
            )}
            {competitiveStatus === 'closed' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-100 border border-red-200 px-3 py-1 rounded-full">
                <Lock size={11} /> Registration Closed
              </span>
            )}
            {competitiveStatus === 'pending' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1 rounded-full">
                <Clock size={11} /> Coming Soon
              </span>
            )}
          </div>

          <div className="p-4">
            {competitiveStatus === 'pending' && (
              <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
                <Clock size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm">Registration for competitive events has not started yet. Check back soon!</p>
              </div>
            )}
            {competitiveStatus === 'closed' && (
              <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                <Lock size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm">Registration for competitive events is now closed.</p>
              </div>
            )}
            {competitiveStatus === 'open' && (
              <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm">Events will be conducted on weekends — <strong>25–26 July</strong> and <strong>8–9 August 2026</strong>. Exact schedule will be shared closer to the date.</p>
              </div>
            )}
            {competitiveEvents.length === 0
              ? <p className="text-sm text-slate-400 py-8 text-center">No competitive events available.</p>
              : renderFlatList(competitiveEvents, isCompetitiveLocked, 'closed')
            }
          </div>
        </div>

        {/* ── CULTURAL ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className={`px-5 py-3 flex flex-wrap items-center gap-3 border-b ${
            culturalStatus === 'open'   ? 'bg-green-50 border-green-100' :
            culturalStatus === 'closed' ? 'bg-slate-100 border-slate-200' :
                                          'bg-blue-50 border-blue-100'
          }`}>
            <div className="flex-1">
              <p className="font-bold text-slate-800">🎭 Cultural Events</p>
              <p className="text-xs text-slate-500 mt-0.5">Dance · Singing · Games · Creative Arts</p>
            </div>
            {culturalStatus === 'open' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">
                <CheckCircle size={11} /> Registration Open
              </span>
            )}
            {culturalStatus === 'closed' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-100 border border-red-200 px-3 py-1 rounded-full">
                <Lock size={11} /> Registration Closed
              </span>
            )}
            {culturalStatus === 'pending' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1 rounded-full">
                <Clock size={11} /> Coming Soon
              </span>
            )}
          </div>

          <div className="p-4 space-y-3">

            {/* Surprise events note — always visible */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-800">
              <Sparkles size={16} className="shrink-0 mt-0.5 text-purple-500" />
              <p className="text-sm">
                We have a few <strong>surprise events</strong> planned — no registration needed, just show up and enjoy!
              </p>
            </div>

            {culturalStatus === 'pending' && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
                <Clock size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm">Cultural event registration has not started yet. Check back soon!</p>
              </div>
            )}
            {culturalStatus === 'closed' && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                <Lock size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm">Registration for cultural events is now closed.</p>
              </div>
            )}
            {culturalStatus === 'open' && (
              <>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                  <div className="text-sm space-y-1">
                    <p><strong>No participation fee</strong> for cultural events. Participants are responsible for bringing their own consumables, props, costumes, and instruments.</p>
                    <p className="text-emerald-700"><strong>Schedule note:</strong> <em>Express Your Creative Freedom</em> will be conducted a week prior — on <strong>9 August</strong>. All other cultural events will be held on <strong>15 August 2026</strong> (Independence Day).</p>
                  </div>
                </div>

                {/* Password gate — shown only when a password is configured and not yet unlocked */}
                {culturalPasswordRequired && !culturalUnlocked ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
                    <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                      <Lock size={15} className="text-amber-600" />
                      Cultural registration is currently restricted to authorised preview.
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordInput}
                          onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }}
                          onKeyDown={e => e.key === 'Enter' && unlockCultural()}
                          placeholder="Enter access password"
                          className={`w-full border rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 ${passwordError ? 'border-red-400 focus:ring-red-300' : 'border-amber-300 focus:ring-amber-300'} bg-white`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-700"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={unlockCultural}
                        disabled={isCheckingPw}
                        className="px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                      >
                        {isCheckingPw ? <><Loader2 size={13} className="animate-spin" /> Checking…</> : 'Unlock'}
                      </button>
                    </div>
                    {passwordError && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} /> Incorrect password. Please try again.</p>}
                  </div>
                ) : (
                  culturalEvents.length === 0
                    ? <p className="text-sm text-slate-400 py-8 text-center">No cultural events available.</p>
                    : renderFlatList(culturalEvents, false, undefined, true)
                )}
              </>
            )}

            {culturalStatus !== 'open' && culturalEvents.length > 0 && (
              renderFlatList(culturalEvents, true, culturalStatus === 'closed' ? 'closed' : 'soon')
            )}
          </div>
        </div>
      </section>

      {/* ── Hint ─────────────────────────────────────────────────────────── */}
      {events.length > 0 && selectedEvents.length === 0 && (
        <p className="text-sm text-slate-400 flex items-center gap-1.5">
          <AlertCircle size={14} /> Select at least one event to register.
        </p>
      )}
      {fieldErrors.event_ids && (
        <FieldError message={fieldErrors.event_ids} />
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
                  <th className="px-4 py-2 text-left font-semibold">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {result.registrations.map(r => (
                  <tr key={r.id} className="hover:bg-green-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-green-800 font-semibold whitespace-nowrap">
                      {r.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700 flex items-center gap-1.5">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${r.is_team ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                          {r.is_team ? 'Team' : 'Solo'}
                        </span>
                        {r.event_name}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">{r.age_group}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {r.team_name
                        ? <span className="font-medium text-blue-700">{r.team_name}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
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
