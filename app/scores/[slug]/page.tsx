import { getTournament, computeStandings, Round, BadmintonCategory, BadmintonMatch, ChessTournamentEntry } from '@/lib/scores'
import Link from 'next/link'
import { ArrowLeft, Play } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-blue-100 text-blue-700' },
  ongoing: { label: 'Live', className: 'bg-green-100 text-green-700 animate-pulse' },
  completed: { label: 'Completed', className: 'bg-slate-100 text-slate-600' },
}

function resultLabel(result: string | null): string {
  if (!result) return '—'
  if (result === '1-0') return '1–0'
  if (result === '0-1') return '0–1'
  if (result === '0.5-0.5') return '½–½'
  return result
}

function StandingsTable({ label, group, rounds, byePts }: { label: string; group: string[]; rounds: Round[]; byePts: number }) {
  const standings = computeStandings(group, rounds, byePts)
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 mb-2">{label}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">#</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Player</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">Pts</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">G</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">W</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.name} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-2 px-3 text-slate-400 font-medium">{i + 1}</td>
                <td className="py-2 px-3 font-medium text-slate-800">{s.name}</td>
                <td className="py-2 px-3 text-center font-bold text-orange-600">
                  {s.games === 0 && s.pts === 0 ? '–' : s.pts % 1 === 0 ? String(s.pts) : s.pts.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-center text-slate-500">{s.games === 0 ? '–' : s.games}</td>
                <td className="py-2 px-3 text-center text-slate-500">{s.games === 0 ? '–' : s.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SchedulePanel({ label, rounds }: { label: string; rounds: Round[] }) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-bold text-slate-700 mb-3">{label}</h3>
      <div className="space-y-4">
        {rounds.map((round) => (
          <div key={round.round}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Round {round.round}</span>
              {round.bye && (
                <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                  Bye: {round.bye}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {round.games.map((g, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-3 py-2 text-sm">
                  <span className="text-slate-700 truncate">
                    <span className="font-medium">{g.white}</span>
                    <span className="text-slate-400 mx-1.5">vs</span>
                    <span className="font-medium">{g.black}</span>
                  </span>
                  <span className={`font-bold tabular-nums shrink-0 ${g.result ? 'text-slate-800' : 'text-slate-300'}`}>
                    {resultLabel(g.result)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function KnockoutCard({ label, player1, player2, result, timeControl }: {
  label: string
  player1: string | null
  player2: string | null
  result: string | null
  timeControl: string
}) {
  const p1 = player1 ?? 'TBD'
  const p2 = player2 ?? 'TBD'
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
      <div>
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">{timeControl}</p>
        <p className="text-sm font-bold text-slate-700">{label}</p>
      </div>
      <div className="space-y-2">
        {[p1, p2].map((player, i) => {
          const isWinner =
            result === 'player1' ? i === 0 : result === 'player2' ? i === 1 : false
          return (
            <div
              key={i}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm ${
                isWinner
                  ? 'bg-orange-50 border-orange-200 font-bold text-orange-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span>{player}</span>
              {isWinner && <span className="text-xs font-semibold text-orange-500">Winner</span>}
            </div>
          )
        })}
      </div>
      {!result && (
        <p className="text-xs text-slate-400">Result pending</p>
      )}
    </div>
  )
}

// ─── Chess age-group section ─────────────────────────────────────────────────

function ChessAgeGroupSection({ entry }: { entry: ChessTournamentEntry }) {
  return (
    <div className="space-y-6">
      {/* Section heading */}
      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none">♟</span>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">{entry.age_group}</h2>
          {entry.subtitle && <p className="text-sm text-slate-500 mt-0.5">{entry.subtitle}</p>}
        </div>
      </div>

      {/* Two-column: participants + format | standings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-6">
          {/* Participants */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">Participants</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500">#</th>
                    <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500">Name</th>
                    <th className="text-left py-2 text-xs font-semibold text-slate-500">Tower</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.participants.map((p, i) => {
                    const tower = p.location.split(' - ')[1] ?? p.location
                    return (
                      <tr key={p.name} className="border-b border-slate-100">
                        <td className="py-2 pr-3 text-slate-400">{i + 1}</td>
                        <td className="py-2 pr-3 font-medium text-slate-800">{p.name}</td>
                        <td className="py-2 text-slate-500 text-xs">{tower}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Format */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">Format</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Time Controls</p>
                <div className="space-y-1">
                  {Object.entries(entry.time_controls).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <span className="text-slate-600 capitalize">{k.replace('_', ' ')}</span>
                      <span className="font-medium text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Scoring</p>
                <div className="flex gap-4 flex-wrap">
                  <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">Win = {entry.scoring.win} pt</span>
                  <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">Draw = {entry.scoring.draw} pt</span>
                  <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">Loss = {entry.scoring.loss} pt</span>
                  <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">Bye = {entry.scoring.bye} pt</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tiebreaks</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                  {entry.tiebreaks.map((tb) => (
                    <li key={tb}>{tb}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Right: standings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-800">Standings</h3>
          <StandingsTable
            label="Group A"
            group={entry.groups.A}
            rounds={entry.schedule.group_a}
            byePts={entry.scoring.bye}
          />
          <StandingsTable
            label="Group B"
            group={entry.groups.B}
            rounds={entry.schedule.group_b}
            byePts={entry.scoring.bye}
          />
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 mb-6">Schedule</h3>
        <div className="flex flex-col sm:flex-row gap-8">
          <SchedulePanel label="Group A Schedule" rounds={entry.schedule.group_a} />
          <div className="hidden sm:block w-px bg-slate-200 shrink-0" />
          <SchedulePanel label="Group B Schedule" rounds={entry.schedule.group_b} />
        </div>
      </div>

      {/* Knockout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 mb-6">Knockout Stage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {entry.knockout.semifinals.map((sf) => (
            <KnockoutCard
              key={sf.id}
              label={sf.label}
              player1={sf.player1}
              player2={sf.player2}
              result={sf.result}
              timeControl={entry.time_controls.semifinals}
            />
          ))}
          <KnockoutCard
            label={entry.knockout.final.label}
            player1={entry.knockout.final.player1}
            player2={entry.knockout.final.player2}
            result={entry.knockout.final.result}
            timeControl={entry.time_controls.final}
          />
          <KnockoutCard
            label={entry.knockout.third_place.label}
            player1={entry.knockout.third_place.player1}
            player2={entry.knockout.third_place.player2}
            result={entry.knockout.third_place.result}
            timeControl={entry.time_controls.third_place}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Badminton components ────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, string> = {
  QR1: 'bg-slate-100 text-slate-600',
  QR2: 'bg-blue-50 text-blue-700',
  QR3: 'bg-indigo-50 text-indigo-700',
  SF:  'bg-orange-50 text-orange-700',
  Final: 'bg-green-50 text-green-700',
}

function MatchRow({ match, isDoubles }: { match: BadmintonMatch; isDoubles: boolean }) {
  const p1 = match.p1 ?? 'TBD'
  const p2 = match.p2 ?? 'TBD'
  const isPending = !match.p1 && !match.p2
  const isWalkover = match.p1 && !match.p2

  if (isPending) {
    return (
      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 text-sm text-slate-400 italic">
        <span className="text-xs font-mono text-slate-300">{match.id}</span>
        <span>Pending previous round</span>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border text-sm overflow-hidden ${match.winner ? 'border-orange-200' : 'border-slate-200'}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-white">
        <span className="text-[10px] font-mono text-slate-300 shrink-0 w-24 truncate">{match.id}</span>
        <div className="flex-1 min-w-0">
          <div className={`flex items-center justify-between gap-2 py-0.5 ${match.winner === match.p1 ? 'font-bold text-orange-700' : 'text-slate-700'}`}>
            <span className={`truncate ${isDoubles ? 'text-xs' : 'text-sm'}`}>{p1}</span>
            {match.score1 != null && (
              <span className="tabular-nums font-bold shrink-0">{match.score1}</span>
            )}
          </div>
          <div className="w-full h-px bg-slate-100 my-0.5" />
          <div className={`flex items-center justify-between gap-2 py-0.5 ${match.winner === match.p2 ? 'font-bold text-orange-700' : 'text-slate-700'}`}>
            <span className={`truncate ${isDoubles ? 'text-xs' : 'text-sm'}`}>
              {isWalkover ? <span className="italic text-slate-400">Walkover</span> : p2}
            </span>
            {match.score2 != null && (
              <span className="tabular-nums font-bold shrink-0">{match.score2}</span>
            )}
          </div>
        </div>
        {match.winner && (
          <span className="shrink-0 text-[10px] font-bold text-orange-500 uppercase">W</span>
        )}
      </div>
    </div>
  )
}

function CategoryCard({ cat }: { cat: BadmintonCategory }) {
  const isDoubles = cat.id === 'MD' || cat.id === 'MID'
  const totalMatches = cat.rounds.reduce((s, r) => s + r.matches.length, 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{cat.id}</span>
            <h3 className="font-bold text-slate-800 text-sm">{cat.name}</h3>
            <span className="text-xs text-slate-500">Age {cat.age}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{cat.format} · {cat.scoring}</p>
        </div>
        <span className="text-xs text-slate-400 shrink-0">{totalMatches} matches</span>
      </div>

      {/* Rounds */}
      <div className="p-4 space-y-4">
        {cat.rounds.map((round) => (
          <div key={round.stage}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STAGE_COLORS[round.stage] ?? 'bg-slate-100 text-slate-600'}`}>
                {round.label}
              </span>
              <span className="text-xs text-slate-400">{round.matches.length} match{round.matches.length !== 1 ? 'es' : ''}</span>
            </div>
            <div className="space-y-1.5">
              {round.matches.map((m) => (
                <MatchRow key={m.id} match={m} isDoubles={isDoubles} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BadmintonTournamentPage({ t, badge, date }: { t: ReturnType<typeof getTournament>; badge: { label: string; className: string }; date: string }) {
  const categories = (t.categories ?? []) as BadmintonCategory[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <header className="border-b border-white/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link href="/scores" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={14} />
            Back to Scores
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl leading-none">🏸</span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{t.title}</h1>
                <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
                {t.venue && <p className="text-xs text-slate-400 mt-0.5">{t.venue}</p>}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>{badge.label}</span>
                  <span className="text-xs text-slate-500">{date}</span>
                  {t.event_time && <span className="text-xs font-medium text-orange-600">{t.event_time}</span>}
                </div>
              </div>
            </div>
            <a
              href={t.live_stream_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 self-start"
            >
              <Play size={16} />
              {t.status === 'upcoming' ? 'Stream starts on event day' : 'Watch Live'}
            </a>
          </div>
        </div>

        {/* Categories summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Categories ({categories.length})</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a key={cat.id} href={`#cat-${cat.id}`} className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-full px-3 py-1.5 text-sm transition-colors">
                <span className="font-bold text-orange-600 text-xs">{cat.id}</span>
                <span className="text-slate-700">{cat.name}</span>
                <span className="text-slate-400 text-xs">({cat.age})</span>
              </a>
            ))}
          </div>
        </div>

        {/* Category fixture grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} id={`cat-${cat.id}`}>
              <CategoryCard cat={cat} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// ─── Main route ──────────────────────────────────────────────────────────────

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = getTournament(slug)

  const badge = STATUS_BADGE[t.status] ?? STATUS_BADGE.upcoming
  const date = new Date(t.event_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (t.sport === 'badminton') {
    return <BadmintonTournamentPage t={t} badge={badge} date={date} />
  }

  // Combined chess page (tournaments array present)
  if (t.sport === 'chess' && t.tournaments && t.tournaments.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <header className="border-b border-white/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
            <Link href="/scores" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={14} />
              Back to Scores
            </Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="text-4xl leading-none">♟</span>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">{t.title}</h1>
                  <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-slate-500">{date}</span>
                    {t.event_time && (
                      <span className="text-xs font-medium text-orange-600">{t.event_time}</span>
                    )}
                  </div>
                </div>
              </div>
              <a
                href={t.live_stream_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 self-start"
              >
                <Play size={16} />
                {t.status === 'upcoming' ? 'Stream starts on event day' : 'Watch Live'}
              </a>
            </div>
          </div>

          {/* Age group sections */}
          {t.tournaments.map((entry, idx) => (
            <div key={entry.age_group}>
              <ChessAgeGroupSection entry={entry} />
              {idx < t.tournaments!.length - 1 && (
                <div className="mt-10 border-t border-slate-200" />
              )}
            </div>
          ))}
        </main>
      </div>
    )
  }

  // Individual chess page (fallback)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Nav */}
      <header className="border-b border-white/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link href="/scores" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={14} />
            Back to Scores
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl leading-none">♟</span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{t.title}</h1>
                <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-slate-500">{date}</span>
                  {t.event_time && (
                    <span className="text-xs font-medium text-orange-600">{t.event_time}</span>
                  )}
                </div>
              </div>
            </div>
            <a
              href={t.live_stream_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 self-start"
            >
              <Play size={16} />
              {t.status === 'upcoming' ? 'Stream starts on event day' : 'Watch Live'}
            </a>
          </div>
        </div>

        {/* Two-column: participants + format | standings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">Participants</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500">#</th>
                      <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500">Name</th>
                      <th className="text-left py-2 text-xs font-semibold text-slate-500">Tower</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.participants.map((p, i) => {
                      const tower = p.location.split(' - ')[1] ?? p.location
                      return (
                        <tr key={p.name} className="border-b border-slate-100">
                          <td className="py-2 pr-3 text-slate-400">{i + 1}</td>
                          <td className="py-2 pr-3 font-medium text-slate-800">{p.name}</td>
                          <td className="py-2 text-slate-500 text-xs">{tower}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Format */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">Format</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Time Controls</p>
                  <div className="space-y-1">
                    {Object.entries(t.time_controls).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <span className="text-slate-600 capitalize">{k.replace('_', ' ')}</span>
                        <span className="font-medium text-slate-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Scoring</p>
                  <div className="flex gap-4 flex-wrap">
                    <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">Win = {t.scoring.win} pt</span>
                    <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">Draw = {t.scoring.draw} pt</span>
                    <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">Loss = {t.scoring.loss} pt</span>
                    <span className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">Bye = {t.scoring.bye} pt</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tiebreaks</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                    {t.tiebreaks.map((tb) => (
                      <li key={tb}>{tb}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Right: standings */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-800">Standings</h2>
            <StandingsTable
              label="Group A"
              group={t.groups.A}
              rounds={t.schedule.group_a}
              byePts={t.scoring.bye}
            />
            <StandingsTable
              label="Group B"
              group={t.groups.B}
              rounds={t.schedule.group_b}
              byePts={t.scoring.bye}
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-6">Schedule</h2>
          <div className="flex flex-col sm:flex-row gap-8">
            <SchedulePanel label="Group A Schedule" rounds={t.schedule.group_a} />
            <div className="hidden sm:block w-px bg-slate-200 shrink-0" />
            <SchedulePanel label="Group B Schedule" rounds={t.schedule.group_b} />
          </div>
        </div>

        {/* Knockout */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-6">Knockout Stage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.knockout.semifinals.map((sf) => (
              <KnockoutCard
                key={sf.id}
                label={sf.label}
                player1={sf.player1}
                player2={sf.player2}
                result={sf.result}
                timeControl={t.time_controls.semifinals}
              />
            ))}
            <KnockoutCard
              label={t.knockout.final.label}
              player1={t.knockout.final.player1}
              player2={t.knockout.final.player2}
              result={t.knockout.final.result}
              timeControl={t.time_controls.final}
            />
            <KnockoutCard
              label={t.knockout.third_place.label}
              player1={t.knockout.third_place.player1}
              player2={t.knockout.third_place.player2}
              result={t.knockout.third_place.result}
              timeControl={t.time_controls.third_place}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
