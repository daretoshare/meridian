import { listTournaments } from '@/lib/scores'
import Link from 'next/link'
import { Trophy, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

const SPORT_ICON: Record<string, string> = {
  chess: '♟',
  badminton: '🏸',
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-blue-100 text-blue-700' },
  ongoing:  { label: 'Live',     className: 'bg-green-100 text-green-700' },
  completed:{ label: 'Completed',className: 'bg-slate-100 text-slate-600' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function ScoresPage() {
  const all = listTournaments()

  // Separate grouped from standalone
  const groupMap = new Map<string, typeof all>()
  const standalone: typeof all = []

  for (const t of all) {
    if (t.group) {
      if (!groupMap.has(t.group)) groupMap.set(t.group, [])
      groupMap.get(t.group)!.push(t)
    } else {
      standalone.push(t)
    }
  }

  // Build display items: grouped first (by insertion order), then standalone
  type GroupedItem = { kind: 'group'; groupName: string; items: typeof all }
  type StandaloneItem = { kind: 'single'; item: (typeof all)[0] }
  type DisplayItem = GroupedItem | StandaloneItem

  const display: DisplayItem[] = [
    ...Array.from(groupMap.entries()).map(([groupName, items]) => ({
      kind: 'group' as const,
      groupName,
      items,
    })),
    ...standalone.map((item) => ({ kind: 'single' as const, item })),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Nav */}
      <header className="border-b border-white/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Trophy size={18} className="text-orange-500" />
            Tournament Scores
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Tournament Scores</h1>
          <p className="text-slate-500 text-sm">Scores are updated live during the event.</p>
        </div>

        {display.length === 0 ? (
          <p className="text-slate-400 text-center py-16">No tournaments yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {display.map((entry) => {
              if (entry.kind === 'group') {
                const { groupName, items } = entry
                const icon = SPORT_ICON[items[0].sport] ?? '🏆'
                const date = formatDate(items[0].event_date)
                const time = items[0].event_time
                // Group status: ongoing > upcoming > completed
                const statusPriority = (s: string) => s === 'ongoing' ? 0 : s === 'upcoming' ? 1 : 2
                const topStatus = items.slice().sort((a, b) => statusPriority(a.status) - statusPriority(b.status))[0].status
                const badge = STATUS_BADGE[topStatus] ?? STATUS_BADGE.upcoming

                return (
                  <div key={groupName} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl leading-none">{icon}</span>
                        <div>
                          <h2 className="font-bold text-slate-800 text-base leading-tight">{groupName}</h2>
                          <p className="text-xs text-slate-500 mt-0.5">{date}</p>
                          {time && <p className="text-xs text-orange-600 font-medium mt-0.5">{time}</p>}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badge.className} ${topStatus === 'ongoing' ? 'animate-pulse' : ''}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Sub-category buttons */}
                    <div className="flex flex-col gap-2">
                      {items.map((t) => (
                        <Link
                          key={t.slug}
                          href={`/scores/${t.slug}`}
                          className="flex items-center justify-between gap-3 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-xl px-4 py-2.5 text-sm transition-colors group"
                        >
                          <span className="font-medium text-slate-700 group-hover:text-orange-700">
                            {t.group_label ?? t.title}
                          </span>
                          <span className="text-slate-400 group-hover:text-orange-500 font-bold">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              // Standalone tile
              const t = entry.item
              const badge = STATUS_BADGE[t.status] ?? STATUS_BADGE.upcoming
              const icon = SPORT_ICON[t.sport] ?? '🏆'
              const date = formatDate(t.event_date)

              return (
                <div key={t.slug} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none">{icon}</span>
                      <div>
                        <h2 className="font-bold text-slate-800 text-base leading-tight">{t.title}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{date}</p>
                        {t.event_time && <p className="text-xs text-orange-600 font-medium mt-0.5">{t.event_time}</p>}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badge.className} ${t.status === 'ongoing' ? 'animate-pulse' : ''}`}>
                      {badge.label}
                    </span>
                  </div>
                  <Link
                    href={`/scores/${t.slug}`}
                    className="mt-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
