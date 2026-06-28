'use client'

import { useMemo } from 'react'
import type { RegistrationWithDetails, EventWithCount } from '@/types/database'
import { Users, CheckCircle, Clock, XCircle, Calendar } from 'lucide-react'

interface Props {
  events: EventWithCount[]
  registrations: RegistrationWithDetails[]
}

const AGE_GROUP_COLORS: Record<string, string> = {
  children: 'bg-yellow-400',
  teens:    'bg-blue-400',
  adults:   'bg-green-400',
  seniors:  'bg-purple-400',
  all:      'bg-orange-400',
}

const AGE_GROUP_LABEL: Record<string, string> = {
  children: 'Children',
  teens:    'Teens',
  adults:   'Adults',
  seniors:  'Seniors',
  all:      'All Ages',
}

export default function EventCalendarView({ events, registrations }: Props) {
  // Per-event registration stats
  const stats = useMemo(() => {
    const map: Record<string, { confirmed: number; waitlisted: number; cancelled: number; total: number }> = {}
    for (const r of registrations) {
      if (!map[r.event_id]) map[r.event_id] = { confirmed: 0, waitlisted: 0, cancelled: 0, total: 0 }
      map[r.event_id][r.status]++
      map[r.event_id].total++
    }
    return map
  }, [registrations])

  // Group events by activity name, sorted by slot_time
  const grouped = useMemo(() => {
    const byName: Record<string, EventWithCount[]> = {}
    for (const e of events) {
      if (!byName[e.name]) byName[e.name] = []
      byName[e.name].push(e)
    }
    // Sort each group by slot_time
    for (const name in byName) {
      byName[name].sort((a, b) => (a.slot_time ?? '').localeCompare(b.slot_time ?? ''))
    }
    return byName
  }, [events])

  const totalRegistrations = registrations.length
  const totalConfirmed  = registrations.filter(r => r.status === 'confirmed').length
  const totalWaitlisted = registrations.filter(r => r.status === 'waitlisted').length
  const totalCancelled  = registrations.filter(r => r.status === 'cancelled').length

  return (
    <div className="space-y-8">

      {/* ── Overall summary bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Registrations" value={totalRegistrations}  color="bg-slate-100"  textColor="text-slate-800"  icon={<Users size={16} className="text-slate-500" />} />
        <SummaryCard label="Confirmed"            value={totalConfirmed}     color="bg-green-50"   textColor="text-green-700"  icon={<CheckCircle size={16} className="text-green-500" />} />
        <SummaryCard label="Waitlisted"           value={totalWaitlisted}    color="bg-yellow-50"  textColor="text-yellow-700" icon={<Clock size={16} className="text-yellow-500" />} />
        <SummaryCard label="Cancelled"            value={totalCancelled}     color="bg-red-50"     textColor="text-red-700"    icon={<XCircle size={16} className="text-red-400" />} />
      </div>

      {/* ── Per-activity groups ── */}
      {Object.entries(grouped).map(([activityName, activityEvents]) => (
        <div key={activityName} className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-orange-500" />
            <h3 className="font-semibold text-slate-800 text-base">{activityName}</h3>
            <span className="text-xs text-slate-400 ml-1">
              {activityEvents.reduce((s, e) => s + (stats[e.id]?.total ?? 0), 0)} registrations across {activityEvents.length} slot{activityEvents.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {activityEvents.map((event) => {
              const s = stats[event.id] ?? { confirmed: 0, waitlisted: 0, cancelled: 0, total: 0 }
              const capacity = event.max_participants
              const fillPct = capacity > 0 ? Math.min(100, Math.round((s.confirmed / capacity) * 100)) : 0

              return (
                <div key={event.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
                >
                  {/* Colour stripe for age group */}
                  <div className={`h-1.5 w-full ${AGE_GROUP_COLORS[event.age_group] ?? 'bg-slate-300'}`} />

                  <div className="p-4 flex flex-col gap-3 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1
                          ${event.age_group === 'children' ? 'bg-yellow-100 text-yellow-800' :
                            event.age_group === 'teens'    ? 'bg-blue-100 text-blue-800'   :
                            event.age_group === 'adults'   ? 'bg-green-100 text-green-800' :
                            event.age_group === 'seniors'  ? 'bg-purple-100 text-purple-800' :
                                                             'bg-orange-100 text-orange-800'}`}
                        >
                          {AGE_GROUP_LABEL[event.age_group]}
                        </span>
                        <p className="text-sm font-semibold text-slate-700">{event.slot_time}</p>
                        <p className="text-xs text-slate-400">{event.location}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-slate-800">{s.total}</p>
                        <p className="text-xs text-slate-400">of {capacity}</p>
                      </div>
                    </div>

                    {/* Capacity fill bar */}
                    <div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${fillPct >= 90 ? 'bg-red-400' : fillPct >= 60 ? 'bg-orange-400' : 'bg-green-400'}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{fillPct}% capacity filled</p>
                    </div>

                    {/* Status breakdown */}
                    <div className="flex items-center gap-2 mt-auto">
                      <StatusPill count={s.confirmed}  label="Confirmed"  bg="bg-green-100"  text="text-green-700"  dot="bg-green-500" />
                      <StatusPill count={s.waitlisted} label="Waitlisted" bg="bg-yellow-100" text="text-yellow-700" dot="bg-yellow-400" />
                      <StatusPill count={s.cancelled}  label="Cancelled"  bg="bg-red-100"    text="text-red-600"   dot="bg-red-400" />
                    </div>

                    {/* Stacked bar showing proportions */}
                    {s.total > 0 && (
                      <div className="flex h-2 rounded-full overflow-hidden gap-px">
                        {s.confirmed  > 0 && <div className="bg-green-400"  style={{ flex: s.confirmed }} title={`${s.confirmed} confirmed`} />}
                        {s.waitlisted > 0 && <div className="bg-yellow-400" style={{ flex: s.waitlisted }} title={`${s.waitlisted} waitlisted`} />}
                        {s.cancelled  > 0 && <div className="bg-red-400"    style={{ flex: s.cancelled }} title={`${s.cancelled} cancelled`} />}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span className="font-medium text-slate-600">Legend:</span>
        <LegendItem color="bg-green-400"  label="Confirmed" />
        <LegendItem color="bg-yellow-400" label="Waitlisted" />
        <LegendItem color="bg-red-400"    label="Cancelled" />
        <span className="ml-4 font-medium text-slate-600">Age groups:</span>
        {Object.entries(AGE_GROUP_COLORS).map(([k, c]) => (
          <LegendItem key={k} color={c} label={AGE_GROUP_LABEL[k]} />
        ))}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color, textColor, icon }: {
  label: string; value: number; color: string; textColor: string; icon: React.ReactNode
}) {
  return (
    <div className={`${color} rounded-xl p-4 flex items-center gap-3`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function StatusPill({ count, label, bg, text, dot }: {
  count: number; label: string; bg: string; text: string; dot: string
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {count} {label}
    </span>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm ${color}`} />
      {label}
    </span>
  )
}
