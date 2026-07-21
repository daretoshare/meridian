import { listTournaments } from '@/lib/scores'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

const SPORT_ICON: Record<string, string> = {
  chess: '♟',
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-blue-100 text-blue-700' },
  ongoing: { label: 'Live', className: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', className: 'bg-slate-100 text-slate-600' },
}

export default function ScoresPage() {
  const tournaments = listTournaments()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Nav */}
      <header className="border-b border-white/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </div>
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

        {tournaments.length === 0 ? (
          <p className="text-slate-400 text-center py-16">No tournaments yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tournaments.map((t) => {
              const badge = STATUS_BADGE[t.status] ?? STATUS_BADGE.upcoming
              const icon = SPORT_ICON[t.sport] ?? '🏆'
              const date = new Date(t.event_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              return (
                <div
                  key={t.slug}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none">{icon}</span>
                      <div>
                        <h2 className="font-bold text-slate-800 text-base leading-tight">{t.title}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{date}</p>
                        {t.event_time && (
                          <p className="text-xs text-orange-600 font-medium mt-0.5">{t.event_time}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badge.className} ${t.status === 'ongoing' ? 'animate-pulse' : ''}`}
                    >
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
