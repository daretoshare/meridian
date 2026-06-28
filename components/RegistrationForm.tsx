'use client'

import { useState, useTransition, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { registrationSchema, type RegistrationFormData } from '@/lib/validations'
import { registerForEvents } from '@/actions/register'
import type { Event } from '@/types/database'
import type { SiteContent } from '@/lib/content'
import { CheckCircle, AlertCircle, Loader2, Calendar, User, Home, Phone, Mail, ExternalLink, FileText } from 'lucide-react'
import Link from 'next/link'
import type { RegistrationSummary } from '@/actions/register'

const AGE_GROUP_LABELS: Record<string, string> = {
  children: 'Children (4–12)',
  teens: 'Teens (13–18)',
  adults: 'Adults (19–59)',
  seniors: 'Seniors (60+)',
  all: 'All Ages',
}

const AGE_GROUP_COLORS: Record<string, string> = {
  children: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  teens: 'bg-blue-100 text-blue-800 border-blue-200',
  adults: 'bg-green-100 text-green-800 border-green-200',
  seniors: 'bg-purple-100 text-purple-800 border-purple-200',
  all: 'bg-orange-100 text-orange-800 border-orange-200',
}

const TOWERS = Array.from({ length: 16 }, (_, i) => `Tower ${i + 1}`)

interface Props {
  events: Event[]
  site: SiteContent
}

export default function RegistrationForm({ events, site }: Props) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string; detail?: string; registrations?: RegistrationSummary[] } | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const {
    register,
    getValues,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormData>({
    defaultValues: { event_ids: [] },
  })

  // Build a map of eventId → activity name for conflict detection
  const eventCategoryMap = useMemo(
    () => Object.fromEntries(events.map((e) => [e.id, e.name])),
    [events]
  )

  const toggleEvent = (id: string) => {
    const category = eventCategoryMap[id]
    setSelectedEvents((prev) => {
      if (prev.includes(id)) {
        // Deselect
        return prev.filter((e) => e !== id)
      }
      // Select: replace any existing pick in the same category, then add this one
      return [...prev.filter((e) => eventCategoryMap[e] !== category), id]
    })
  }

  const downloadReceiptPDF = (regs: RegistrationSummary[]) => {
    const vals = getValues()
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    const rows = regs.map((r) => `
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; padding: 32px; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .logo { width: 40px; height: 40px; background: linear-gradient(135deg,#f97316,#ea580c);
            border-radius: 8px; display: flex; align-items: center; justify-content: center;
            color: #fff; font-weight: 700; font-size: 14px; }
    h1 { font-size: 18px; font-weight: 700; }
    .sub { font-size: 11px; color: #64748b; }
    .badge { display: inline-block; background: #dcfce7; color: #16a34a; font-size: 11px;
             font-weight: 600; padding: 3px 10px; border-radius: 20px; margin: 12px 0 16px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px;
                 background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .info-item label { display: block; font-size: 10px; color: #94a3b8; text-transform: uppercase;
                       letter-spacing: .05em; margin-bottom: 2px; }
    .info-item span { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; text-align: left; padding: 7px 10px; font-size: 10px;
         text-transform: uppercase; letter-spacing: .05em; border-bottom: 2px solid #e2e8f0; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    tr:nth-child(even) td { background: #fafafa; }
    .mono { font-family: monospace; font-weight: 700; font-size: 13px; color: #0f172a; }
    small { display: block; color: #64748b; font-size: 10px; text-transform: capitalize; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0;
              font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">MP</div>
    <div>
      <h1>Meridian Park — Registration Receipt</h1>
      <p class="sub">Independence Day Celebrations 2025 &nbsp;·&nbsp; Generated ${now}</p>
    </div>
  </div>
  <span class="badge">✓ Registration Confirmed</span>
  <div class="info-grid">
    <div class="info-item"><label>Name</label><span>${vals.full_name ?? ''}</span></div>
    <div class="info-item"><label>Email</label><span>${vals.email ?? ''}</span></div>
    <div class="info-item"><label>Tower / Apartment</label><span>${vals.tower ?? ''} / ${vals.apartment_number ?? ''}</span></div>
    <div class="info-item"><label>Phone</label><span>${vals.phone_number ?? ''}</span></div>
  </div>
  <table>
    <thead>
      <tr><th>Reg ID</th><th>Event</th><th>Date</th><th>Time</th><th>Venue</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <span>Keep this receipt. Use your Reg ID to check status at the society portal.</span>
    <span>Meridian Park · Independence Day 2025</span>
  </div>
  <script>window.onload = () => { window.print() }</script>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close() }
  }

  const handleSubmitClick = () => {
    const raw = { ...getValues(), event_ids: selectedEvents }
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
    startTransition(async () => {
      setResult(null)
      const res = await registerForEvents(parsed.data)
      setResult(res)
      if (res.success) {
        reset()
        setSelectedEvents([])
      }
    })
  }

  // Group events: date → activity name → slots, sorted chronologically
  const eventsByDate = useMemo(() => {
    const byDate: Record<string, Record<string, Event[]>> = {}
    for (const e of events) {
      const day = (e as any).event_date ?? 'unscheduled'
      if (!byDate[day]) byDate[day] = {}
      if (!byDate[day][e.name]) byDate[day][e.name] = []
      byDate[day][e.name].push(e)
    }
    return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b))
  }, [events])

  function formatEventDate(iso: string): string {
    if (iso === 'unscheduled') return 'Date TBD'
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
      {/* ── Personal Details ── */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User size={20} className="text-orange-500" />
          {site.form_section_personal}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('full_name')}
              placeholder="Rajesh Kumar"
              className="input-field"
            />
            {(fieldErrors.full_name || errors.full_name) && <FieldError message={fieldErrors.full_name ?? errors.full_name!.message!} />}
          </div>

          {/* Tower */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Home size={14} className="inline mr-1 text-slate-500" />
              Tower <span className="text-red-500">*</span>
            </label>
            <select {...register('tower')} className="input-field">
              <option value="">Select tower…</option>
              {TOWERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {(fieldErrors.tower || errors.tower) && <FieldError message={fieldErrors.tower ?? errors.tower!.message!} />}
          </div>

          {/* Apartment Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Apartment Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register('apartment_number')}
              placeholder="50123"
              maxLength={6}
              className="input-field"
            />
            <p className="text-xs text-slate-400 mt-1">5 or 6 digits, starting with 5 or 6</p>
            {(fieldErrors.apartment_number || errors.apartment_number) && <FieldError message={fieldErrors.apartment_number ?? errors.apartment_number!.message!} />}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Phone size={14} className="inline mr-1 text-slate-500" />
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 rounded-l-lg bg-slate-50 text-slate-500 text-sm">
                +91
              </span>
              <input
                {...register('phone_number')}
                placeholder="9876543210"
                maxLength={10}
                className="input-field rounded-l-none"
              />
            </div>
            {(fieldErrors.phone_number || errors.phone_number) && <FieldError message={fieldErrors.phone_number ?? errors.phone_number!.message!} />}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Mail size={14} className="inline mr-1 text-slate-500" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="rajesh@example.com"
              className="input-field"
            />
            {(fieldErrors.email || errors.email) && <FieldError message={fieldErrors.email ?? errors.email!.message!} />}
          </div>
        </div>
      </section>

      {/* ── Event Selection ── */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <Calendar size={20} className="text-orange-500" />
          {site.form_section_events}
        </h2>
        <p className="text-sm text-slate-500 mb-4">{site.form_events_hint}</p>

        {events.length === 0 ? (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
            <Calendar size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">{site.form_events_empty_title}</p>
            <p className="text-sm mt-1">{site.form_events_empty_hint}</p>
          </div>
        ) : (
          eventsByDate.map(([date, activitiesOnDay]) => (
            <div key={date} className="mb-8">
              {/* Day header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-slate-800 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
                  <Calendar size={14} />
                  {formatEventDate(date)}
                </div>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Activities on this day */}
              {Object.entries(activitiesOnDay).map(([activityName, activityEvents]) => (
                <div key={activityName} className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">
                    {activityName}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3 italic">
                    Pick one age group — selecting another will replace your current choice.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activityEvents.map((event) => {
                  const isSelected = selectedEvents.includes(event.id)
                  const categoryHasOtherSelected =
                    !isSelected &&
                    selectedEvents.some((id) => eventCategoryMap[id] === activityName)
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => toggleEvent(event.id)}
                      className={`
                        relative text-left p-4 rounded-xl border-2 transition-all duration-150
                        ${isSelected
                          ? 'border-orange-400 bg-orange-50 shadow-sm'
                          : categoryHasOtherSelected
                          ? 'border-slate-200 bg-slate-50 opacity-60 hover:opacity-100 hover:border-slate-300'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }
                      `}
                    >
                      {isSelected && (
                        <CheckCircle
                          size={18}
                          className="absolute top-3 right-3 text-orange-500"
                        />
                      )}
                      <div className="flex items-start gap-2 flex-wrap mb-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${AGE_GROUP_COLORS[event.age_group]}`}
                        >
                          {AGE_GROUP_LABELS[event.age_group]}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700">{event.slot_time}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{event.location}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Max {event.max_participants} participants
                      </p>
                    </button>
                  )
                })}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

        {events.length > 0 && selectedEvents.length === 0 && (
          <p className="text-sm text-red-500 mt-1">Please select at least one event.</p>
        )}
      </section>

      {/* ── Result ── */}
      {result && !result.success && (
        <div className="flex items-start gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{result.message}</p>
            {result.detail && <p className="text-xs mt-1 opacity-75 font-mono">{result.detail}</p>}
          </div>
        </div>
      )}

      {result?.success && result.registrations && result.registrations.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-green-100 border-b border-green-200">
            <CheckCircle size={22} className="text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-green-800">{result.message}</p>
              <p className="text-xs text-green-600 mt-0.5">
                Save your registration IDs below — you'll need them to check your status.
              </p>
            </div>
          </div>

          {/* Registration table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-50 border-b border-green-200 text-xs text-green-700 uppercase tracking-wide">
                  <th className="px-4 py-2 text-left font-semibold">Registration ID</th>
                  <th className="px-4 py-2 text-left font-semibold">Event</th>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Time</th>
                  <th className="px-4 py-2 text-left font-semibold">Venue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {result.registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-green-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-green-800 font-semibold whitespace-nowrap">
                      {r.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{r.event_name}</p>
                      <p className="text-xs text-slate-400 capitalize">{r.age_group}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">
                      {r.event_date
                        ? new Date(r.event_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{r.slot_time}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{r.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer: download + status link */}
          <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <button
              type="button"
              onClick={() => downloadReceiptPDF(result!.registrations!)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
            >
              <FileText size={12} /> Download Receipt (PDF)
            </button>
            <Link href="/status"
              className="flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 underline underline-offset-2">
              Check registration status <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Submit ── */}
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
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Registering…
          </>
        ) : (
          `Register for ${selectedEvents.length || 0} Event${selectedEvents.length !== 1 ? 's' : ''}`
        )}
      </button>
    </form>
  )
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle size={12} />
      {message}
    </p>
  )
}
