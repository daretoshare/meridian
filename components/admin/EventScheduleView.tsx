'use client'

import { useMemo, useState } from 'react'
import type { RegistrationWithDetails, EventWithCount } from '@/types/database'
import { ChevronDown, ChevronRight, Users, CheckCircle, Clock, XCircle, MapPin, CalendarDays } from 'lucide-react'

interface Props {
  events: EventWithCount[]
  registrations: RegistrationWithDetails[]
}

const AGE_GROUP_LABEL: Record<string, string> = {
  children: 'Children (4–12)',
  teens:    'Teens (13–18)',
  adults:   'Adults (19–59)',
  seniors:  'Seniors (60+)',
  all:      'All Ages',
}

const AGE_CHIP: Record<string, string> = {
  children: 'bg-yellow-100 text-yellow-800',
  teens:    'bg-blue-100   text-blue-800',
  adults:   'bg-green-100  text-green-800',
  seniors:  'bg-purple-100 text-purple-800',
  all:      'bg-orange-100 text-orange-800',
}

const AGE_BAR: Record<string, string> = {
  children: 'bg-yellow-400',
  teens:    'bg-blue-400',
  adults:   'bg-green-400',
  seniors:  'bg-purple-400',
  all:      'bg-orange-400',
}

function parseStartMinutes(slot: string): number {
  const m = slot.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return 9999
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const meridiem = m[3].toUpperCase()
  if (meridiem === 'PM' && h !== 12) h += 12
  if (meridiem === 'AM' && h === 12) h = 0
  return h * 60 + min
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function isToday(iso: string): boolean {
  return new Date(iso + 'T00:00:00').toDateString() === new Date().toDateString()
}

export default function EventScheduleView({ events, registrations }: Props) {
  const stats = useMemo(() => {
    const map: Record<string, { confirmed: number; waitlisted: number; cancelled: number }> = {}
    for (const r of registrations) {
      if (!map[r.event_id]) map[r.event_id] = { confirmed: 0, waitlisted: 0, cancelled: 0 }
      map[r.event_id][r.status]++
    }
    return map
  }, [registrations])

  // Group by date → activity → slots
  const days = useMemo(() => {
    const byDate: Record<string, EventWithCount[]> = {}
    for (const e of events) {
      const key = e.event_date ?? 'unscheduled'
      if (!byDate[key]) byDate[key] = []
      byDate[key].push(e)
    }

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dayEvents]) => {
        const byActivity: Record<string, EventWithCount[]> = {}
        for (const e of dayEvents) {
          if (!byActivity[e.name]) byActivity[e.name] = []
          byActivity[e.name].push(e)
        }

        const lanes = Object.entries(byActivity)
          .map(([name, slots]) => ({
            name,
            slots: [...slots].sort((a, b) => parseStartMinutes(a.slot_time) - parseStartMinutes(b.slot_time)),
            totalReg: slots.reduce((s, e) => {
              const st = stats[e.id] ?? { confirmed: 0, waitlisted: 0, cancelled: 0 }
              return s + st.confirmed + st.waitlisted + st.cancelled
            }, 0),
            totalCap: slots.reduce((s, e) => s + e.max_participants, 0),
          }))
          .sort((a, b) => parseStartMinutes(a.slots[0]?.slot_time ?? '') - parseStartMinutes(b.slots[0]?.slot_time ?? ''))

        const dayTimes = dayEvents.map(e => parseStartMinutes(e.slot_time)).filter(t => t !== 9999)
        const dayStart = dayTimes.length ? Math.min(...dayTimes) : 420
        const dayEnd   = dayTimes.length ? Math.max(...dayTimes) + 120 : 1320

        return { date, lanes, dayStart, dayEnd }
      })
  }, [events, stats])

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }))

  const grandTotal     = registrations.length
  const grandConfirmed = registrations.filter(r => r.status === 'confirmed').length
  const grandWait      = registrations.filter(r => r.status === 'waitlisted').length
  const grandCancel    = registrations.filter(r => r.status === 'cancelled').length

  return (
    <div className="space-y-8">

      {/* Summary strip */}
      <div className="flex flex-wrap gap-3">
        <Pill icon={<Users size={13} />}       label="Total"      value={grandTotal}     cls="bg-slate-100 text-slate-700" />
        <Pill icon={<CheckCircle size={13} />} label="Confirmed"  value={grandConfirmed} cls="bg-green-50  text-green-700" />
        <Pill icon={<Clock size={13} />}       label="Waitlisted" value={grandWait}      cls="bg-yellow-50 text-yellow-700" />
        <Pill icon={<XCircle size={13} />}     label="Cancelled"  value={grandCancel}    cls="bg-red-50    text-red-600" />
      </div>

      {/* Day sections */}
      {days.map(({ date, lanes, dayStart, dayEnd }) => {
        const daySpan = (dayEnd - dayStart) || 1
        const pctPos  = (slot: string) => ((parseStartMinutes(slot) - dayStart) / daySpan) * 100
        const dayReg  = lanes.reduce((s, l) => s + l.totalReg, 0)
        const today   = date !== 'unscheduled' && isToday(date)

        return (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold
                ${today ? 'bg-orange-500 text-white' : date === 'unscheduled' ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-white'}`}
              >
                <CalendarDays size={14} />
                {date === 'unscheduled' ? 'No date set' : formatDate(date)}
                {today && <span className="text-xs font-normal opacity-80 ml-1">Today</span>}
              </div>
              <span className="text-sm text-slate-400">{dayReg} registration{dayReg !== 1 ? 's' : ''} across {lanes.length} event{lanes.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Hour ruler for this day */}
            <div className="relative h-6 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden mb-2">
              {Array.from({ length: Math.ceil(daySpan / 60) + 1 }, (_, i) => {
                const mins = dayStart + i * 60
                const left = ((mins - dayStart) / daySpan) * 100
                const h = Math.floor(mins / 60)
                const label = h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`
                return left <= 100 ? (
                  <div key={i} className="absolute top-0 bottom-0" style={{ left: `${left}%` }}>
                    <div className="w-px h-full bg-slate-200" />
                    <span className="absolute top-0.5 text-[10px] text-slate-400 ml-1 whitespace-nowrap">{label}</span>
                  </div>
                ) : null
              })}
            </div>

            {/* Swimlanes for this day */}
            <div className="space-y-2 mb-2">
              {lanes.map(lane => {
                const laneKey = `${date}__${lane.name}`
                const isOpen  = !!expanded[laneKey]
                const fillPct = lane.totalCap > 0 ? Math.min(100, Math.round((lane.totalReg / lane.totalCap) * 100)) : 0

                return (
                  <div key={laneKey} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Collapsed header */}
                    <button
                      onClick={() => toggle(laneKey)}
                      className="w-full flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="text-slate-400 shrink-0">
                        {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </span>

                      <span className="font-semibold text-slate-800 w-44 shrink-0 truncate text-sm">
                        {lane.name}
                      </span>

                      {/* Mini timeline */}
                      <div className="relative flex-1 h-7 bg-slate-50 rounded overflow-hidden hidden sm:block">
                        {lane.slots.map(slot => {
                          const st    = stats[slot.id] ?? { confirmed: 0, waitlisted: 0, cancelled: 0 }
                          const total = st.confirmed + st.waitlisted + st.cancelled
                          const left  = Math.min(pctPos(slot.slot_time), 82)
                          return (
                            <div key={slot.id}
                              className={`absolute top-1 bottom-1 rounded flex items-center justify-center text-[10px] font-bold text-white min-w-[28px] px-1 ${AGE_BAR[slot.age_group]}`}
                              style={{ left: `${left}%`, width: '14%' }}
                              title={`${AGE_GROUP_LABEL[slot.age_group]} · ${slot.slot_time} · ${total} registered`}
                            >
                              {total}
                            </div>
                          )
                        })}
                      </div>

                      {/* Count + fill bar */}
                      <div className="flex items-center gap-3 shrink-0 ml-auto">
                        <div className="text-right hidden md:block">
                          <p className="text-sm font-bold text-slate-700">{lane.totalReg}</p>
                          <p className="text-[10px] text-slate-400">registered</p>
                        </div>
                        <div className="w-16">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${fillPct >= 90 ? 'bg-red-400' : fillPct >= 60 ? 'bg-orange-400' : 'bg-green-400'}`}
                              style={{ width: `${fillPct}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 text-right mt-0.5">{fillPct}%</p>
                        </div>
                      </div>
                    </button>

                    {/* Expanded: one row per slot */}
                    {isOpen && (
                      <div className="border-t border-slate-100 divide-y divide-slate-50">
                        {lane.slots.map(slot => {
                          const st    = stats[slot.id] ?? { confirmed: 0, waitlisted: 0, cancelled: 0 }
                          const total = st.confirmed + st.waitlisted + st.cancelled
                          const cap   = slot.max_participants

                          return (
                            <div key={slot.id}
                              className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 ${!slot.is_active ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50/60'}`}
                            >
                              {/* Age group + time + location */}
                              <div className="flex items-start gap-3 sm:w-72 shrink-0">
                                <div className={`w-1.5 self-stretch rounded-full mt-0.5 ${AGE_BAR[slot.age_group]}`} />
                                <div>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${AGE_CHIP[slot.age_group]}`}>
                                    {AGE_GROUP_LABEL[slot.age_group]}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <Clock size={12} className="text-slate-400" />
                                    <span className="text-sm text-slate-600">{slot.slot_time}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <MapPin size={12} className="text-slate-400" />
                                    <span className="text-xs text-slate-400">{slot.location}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status dots */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <StatusDot color="bg-green-500"  label="Confirmed"  count={st.confirmed} />
                                <StatusDot color="bg-yellow-400" label="Waitlisted" count={st.waitlisted} />
                                <StatusDot color="bg-red-400"    label="Cancelled"  count={st.cancelled} />
                              </div>

                              {/* Stacked bar */}
                              <div className="flex-1 min-w-0">
                                {total > 0 ? (
                                  <div className="flex h-4 rounded overflow-hidden gap-px">
                                    {st.confirmed  > 0 && <div className="bg-green-400"  style={{ flex: st.confirmed }}  title={`${st.confirmed} confirmed`} />}
                                    {st.waitlisted > 0 && <div className="bg-yellow-400" style={{ flex: st.waitlisted }} title={`${st.waitlisted} waitlisted`} />}
                                    {st.cancelled  > 0 && <div className="bg-red-400"    style={{ flex: st.cancelled }}  title={`${st.cancelled} cancelled`} />}
                                    {(cap - total) > 0  && <div className="bg-slate-100" style={{ flex: cap - total }}   title={`${cap - total} open`} />}
                                  </div>
                                ) : (
                                  <div className="h-4 bg-slate-100 rounded" />
                                )}
                                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                                  <span>{total} registered</span>
                                  <span>{cap - total > 0 ? `${cap - total} open` : 'Full'} / {cap} cap</span>
                                </div>
                              </div>

                              {!slot.is_active && (
                                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">Hidden</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
        <LegendDot color="bg-green-400"  label="Confirmed" />
        <LegendDot color="bg-yellow-400" label="Waitlisted" />
        <LegendDot color="bg-red-400"    label="Cancelled" />
        <LegendDot color="bg-slate-100"  label="Open slots" />
        <span className="text-slate-300 mx-1">|</span>
        {Object.entries(AGE_BAR).map(([k, c]) => <LegendDot key={k} color={c} label={AGE_GROUP_LABEL[k]} />)}
      </div>
    </div>
  )
}

function Pill({ icon, label, value, cls }: { icon: React.ReactNode; label: string; value: number; cls: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${cls}`}>
      {icon}
      <span className="font-bold">{value}</span>
      <span className="text-xs opacity-75">{label}</span>
    </div>
  )
}

function StatusDot({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
      <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />
      <span className="font-medium">{count}</span>
      <span className="text-slate-400">{label}</span>
    </span>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm ${color}`} />
      {label}
    </span>
  )
}
