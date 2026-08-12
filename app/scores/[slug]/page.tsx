import { getTournament, computeStandings, Round, BadmintonCategory, BadmintonMatch, ChessTournamentEntry } from '@/lib/scores'
import Link from 'next/link'
import { ArrowLeft, Play } from 'lucide-react'
import CollapsibleRules from '@/components/CollapsibleRules'

export const dynamic = 'force-dynamic'

function simpleMarkdownToHtml(md: string): string {
  const lines = md.split('\n').filter(l => !l.startsWith('## '))
  const out: string[] = []
  let inUl = false

  const closeUl = () => { if (inUl) { out.push('</ul>'); inUl = false } }

  const inline = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code class="bg-slate-100 px-1 rounded text-xs font-mono">$1</code>')

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line) { closeUl(); out.push(''); continue }

    if (line.startsWith('### ')) {
      closeUl()
      out.push(`<h3 class="text-sm font-bold text-slate-700 mt-5 mb-2">${inline(line.slice(4))}</h3>`)
    } else if (line.startsWith('## ')) {
      closeUl()
      out.push(`<h2 class="text-base font-bold text-slate-800 mt-6 mb-3 border-b border-slate-100 pb-1">${inline(line.slice(3))}</h2>`)
    } else if (/^  - /.test(line)) {
      // sub-bullet — wrapped as a plain item with indent
      if (!inUl) { out.push('<ul class="list-none space-y-1 ml-0">'); inUl = true }
      out.push(`<li class="pl-6 text-sm text-slate-600 before:content-['–'] before:mr-2 before:text-slate-400">${inline(line.replace(/^  - /, ''))}</li>`)
    } else if (line.startsWith('- ')) {
      if (!inUl) { out.push('<ul class="list-none space-y-1.5">'); inUl = true }
      out.push(`<li class="flex gap-2 text-sm text-slate-600"><span class="text-orange-400 mt-0.5 shrink-0">•</span><span>${inline(line.slice(2))}</span></li>`)
    } else {
      closeUl()
      out.push(`<p class="text-sm text-slate-600">${inline(line)}</p>`)
    }
  }
  closeUl()
  return out.join('\n')
}


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

// ─── Chess tournament story ──────────────────────────────────────────────────

function ChessTournamentStory({ entry }: { entry: ChessTournamentEntry }) {
  const isAbove10 = entry.age_group.toLowerCase().includes('10+') || entry.age_group.toLowerCase().includes('above') || entry.age_group.toLowerCase().includes('above 10') || (!entry.age_group.toLowerCase().includes('up to') && !entry.age_group.toLowerCase().includes('upto') && !entry.age_group.toLowerCase().includes('under'))

  if (isAbove10) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>♟</span> Tournament Story · Age 10+
        </h3>

        {/* Champion callout */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-xs text-amber-300 font-semibold uppercase tracking-wide">Champion</p>
            <p className="text-base font-bold text-white">Aarush Pradish</p>
            <p className="text-xs text-slate-400">Beat Samaira Agrawal in Armageddon tiebreak</p>
          </div>
        </div>

        {/* Stat callouts */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Group A Dominant</p>
            <p className="text-sm font-bold text-orange-300">Arjun Madiraju — 4/4 · Undefeated</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Runner-up</p>
            <p className="text-sm font-bold text-orange-300">Samaira Agrawal — Final via Armageddon</p>
          </div>
        </div>

        {/* Narrative */}
        <p className="text-sm text-slate-300 leading-relaxed">
          Group A was a masterclass in precision — Arjun Madiraju swept every board undefeated, with Aarush Pradish holding firm for second. Group B brought drama: Nisha Bansal took the title, while Samaira earned her spot on consistency. The knockouts delivered even more: Aarush dismantled Nisha 2–0, Samaira edged Arjun in Armageddon. The final went the distance — Samaira won Round 1, Aarush levelled, then claimed Armageddon to be crowned champion.
        </p>

        {/* Results grid */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Knockout Results</p>
          {[
            { label: 'SF1', winner: 'Aarush Pradish', loser: 'Nisha Bansal', score: '2–0' },
            { label: 'SF2', winner: 'Samaira Agrawal', loser: 'Arjun Madiraju', score: '2–1 (Arma)' },
            { label: '3rd Place', winner: 'Arjun Madiraju', loser: 'Nisha Bansal', score: '2–0' },
            { label: 'Final', winner: 'Aarush Pradish', loser: 'Samaira Agrawal', score: '2–1 (Arma)', isChampion: true },
          ].map(r => (
            <div key={r.label} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${(r as { isChampion?: boolean }).isChampion ? 'bg-amber-500/15 border border-amber-400/30' : 'bg-white/8 border border-white/10'}`}>
              <span className={`text-xs font-bold w-16 shrink-0 ${(r as { isChampion?: boolean }).isChampion ? 'text-amber-300' : 'text-slate-500'}`}>{r.label}</span>
              <span className="text-sm font-semibold text-white">{r.winner}</span>
              <span className="text-xs text-slate-500">def.</span>
              <span className="text-sm text-slate-400">{r.loser}</span>
              <span className="ml-auto text-xs font-bold text-orange-300 shrink-0">{r.score}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Age up to 10
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white space-y-5">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <span>♟</span> Tournament Story · Age up to 10
      </h3>

      {/* Champion callout */}
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="text-xs text-amber-300 font-semibold uppercase tracking-wide">Champion</p>
          <p className="text-base font-bold text-white">Aviroon Das</p>
          <p className="text-xs text-slate-400">Beat Evan Joe Jerin in Armageddon tiebreak</p>
        </div>
      </div>

      {/* Stat callouts */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Group A Dominant</p>
          <p className="text-sm font-bold text-orange-300">Netik Chowdary — 5/5 · Unstoppable</p>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Perfect Group B</p>
          <p className="text-sm font-bold text-orange-300">Evan Joe Jerin — 5/5 · Runner-up</p>
        </div>
      </div>

      {/* Narrative */}
      <p className="text-sm text-slate-300 leading-relaxed">
        Two players dominated the group stage without dropping a point: Netik Chowdary in Group A and Evan Joe Jerin in Group B. But the knockouts rewrote the script — Aviroon Das, who had pushed Evan closest in groups, pulled off the tournament&apos;s biggest upset in the semis, beating Netik via Armageddon. Evan cruised past Avyaan 2–0 on the other side. The final was a thriller: Evan won Round 1, Aviroon levelled, then held his nerve in Armageddon to be crowned champion.
      </p>

      {/* Results grid */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Knockout Results</p>
        {[
          { label: 'SF1', winner: 'Aviroon Das', loser: 'Netik Chowdary', score: '2–1 (Arma)' },
          { label: 'SF2', winner: 'Evan Joe Jerin', loser: 'Avyaan', score: '2–0' },
          { label: '3rd Place', winner: 'Avyaan', loser: 'Netik Chowdary', score: '2–0' },
          { label: 'Final', winner: 'Aviroon Das', loser: 'Evan Joe Jerin', score: '2–1 (Arma)', isChampion: true },
        ].map(r => (
          <div key={r.label} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${(r as { isChampion?: boolean }).isChampion ? 'bg-amber-500/15 border border-amber-400/30' : 'bg-white/8 border border-white/10'}`}>
            <span className={`text-xs font-bold w-16 shrink-0 ${(r as { isChampion?: boolean }).isChampion ? 'text-amber-300' : 'text-slate-500'}`}>{r.label}</span>
            <span className="text-sm font-semibold text-white">{r.winner}</span>
            <span className="text-xs text-slate-500">def.</span>
            <span className="text-sm text-slate-400">{r.loser}</span>
            <span className="ml-auto text-xs font-bold text-orange-300 shrink-0">{r.score}</span>
          </div>
        ))}
      </div>
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

      {/* Tournament Story */}
      <ChessTournamentStory entry={entry} />
    </div>
  )
}

// ─── Badminton tournament story ──────────────────────────────────────────────

const CATEGORY_STORIES: Record<string, {
  gradient: string
  stats: { title: string; value: string }[]
  narrative: string
  results: string[]
  resultsLabel: string
}> = {
  MS: {
    gradient: 'from-slate-900 to-slate-800',
    stats: [
      { title: 'Champion', value: 'Manoj Shenoy — won 21–15 in the final' },
      { title: 'SF Upset', value: 'Ketan Suthar (top seed) knocked out 21–13' },
    ],
    narrative: "Manoj Shenoy's run to the title was the story of the tournament. He first stunned Biswajeet Das 21–6 in the semis, then overcame Shobhit Gupta 21–15 in a closely fought final. Ketan Suthar — unbeaten through qualifying — fell 21–13 to Shobhit in the other semi, ending his undefeated run. Biswajeet Das took the bronze.",
    results: ['🥇 Final: Manoj Shenoy 21–15 Shobhit Gupta', '🥈 Runner-up: Shobhit Gupta', '🥉 3rd: Biswajeet Das (bt Ketan 21–13)'],
    resultsLabel: 'Final Results',
  },
  WS: {
    gradient: 'from-indigo-900 to-purple-900',
    stats: [
      { title: 'Champion', value: 'Priyansha Verma — won 15–4 in the final' },
      { title: 'SF Flyer', value: 'Priyansha bt Aakansha 15–1 · near walkover' },
    ],
    narrative: "Priyansha Verma was simply in a different class. She dispatched Aakansha Baluni 15–1 in the semis, and then dominated Sanghamitra Barman 15–4 in the final to claim the Women's Singles crown without breaking a sweat. Sanghamitra had edged out Ankita Pattnaik 15–12 in the other semi. Ankita took the bronze over Aakansha.",
    results: ['🥇 Final: Priyansha Verma 15–4 Sanghamitra Barman', '🥈 Runner-up: Sanghamitra Barman', '🥉 3rd: Ankita Pattnaik (bt Aakansha 21–16)'],
    resultsLabel: 'Final Results',
  },
  MD: {
    gradient: 'from-blue-900 to-cyan-900',
    stats: [
      { title: 'Champions', value: 'Biswajeet + Manoj — won 21–7 in the final' },
      { title: 'SF Thriller', value: 'Biswajeet + Manoj edged 23–21 vs Peeyush + Shobhit' },
    ],
    narrative: "Biswajeet Das & Manoj Shenoy survived a deuce-point thriller in the semis — edging Peeyush & Shobhit 23–21 — before turning dominant in the final, dismantling Vijay Bala & Abhishek Rathore 21–7 to claim the Men's Doubles title. The other semi was a straight sets win for Vijay & Abhishek 21–8 over Nishant & Rajeev.",
    results: ['🥇 Final: Biswajeet+Manoj 21–7 Vijay+Abhishek', '🥈 Runner-up: Vijay Bala + Abhishek Rathore', '🥉 3rd: Peeyush + Shobhit (bt Nishant+Rajeev 21–11)'],
    resultsLabel: 'Final Results',
  },
  MID: {
    gradient: 'from-rose-900 to-pink-900',
    stats: [
      { title: 'Champions', value: 'Biswajeet + Ankita — won 15–7 in the final' },
      { title: 'Tight Bronze', value: 'Ketan + Komal edged 22–20 in deuce' },
    ],
    narrative: "Biswajeet Das & Ankita Pattnaik swept through the draw — beating Ketan & Komal 21–12 in the semis and then Shobhit & Shruti 15–7 to claim Mixed Doubles gold. Shobhit & Shruti had cruised past Priyansha & Prashant 15–2 in their semi. The 3rd place match went to deuce, with Ketan & Komal holding on 22–20.",
    results: ['🥇 Final: Biswajeet+Ankita 15–7 Shobhit+Shruti', '🥈 Runner-up: Shobhit + Shruti Gupta', '🥉 3rd: Ketan + Komal (22–20 in deuce)'],
    resultsLabel: 'Final Results',
  },
  BS: {
    gradient: 'from-green-900 to-emerald-900',
    stats: [
      { title: 'Champion', value: 'Ishan Deb — won 15–5 in the final' },
      { title: 'SF Form', value: 'Ishan bt Arshit 21–12 · composed display' },
    ],
    narrative: "Ishan Deb was the class of the Boys Singles field from start to finish. He beat Arshit 21–12 in the semis — a controlled, confident display — and then dispatched Tabish Ansari 15–5 in the final (15-pt format) to take the title. Tabish had overcome Ridhaan Vijayshekar 21–14 in the other semi to earn his runner-up spot.",
    results: ['🥇 Final: Ishan Deb 15–5 Tabish Ansari', '🥈 Runner-up: Tabish Ansari', '🥉 3rd: Ridhaan Vijayshekar'],
    resultsLabel: 'Final Results',
  },
  GS: {
    gradient: 'from-fuchsia-900 to-violet-900',
    stats: [
      { title: 'Champion', value: 'Shreya Shaanvi — won 15–7 in the final' },
      { title: 'SF Sweep', value: 'Shreya bt Saanvi 15–4 · clinical win' },
    ],
    narrative: "Shreya Shaanvi produced the tournament's big upset — beating Saanvi Agrawal 15–4 in the semis and then defeating Ashwika Gopu 15–7 in the final to claim Girls Singles gold. Ashwika had beaten Yuvika Gupta 21–12 in the other semi. The 3rd-place match between Saanvi and Yuvika was not played.",
    results: ['🥇 Final: Shreya Shaanvi 15–7 Ashwika Gopu', '🥈 Runner-up: Ashwika Gopu', '🥉 3rd: TBD (match not played)'],
    resultsLabel: 'Final Results',
  },
  KBS: {
    gradient: 'from-amber-900 to-orange-900',
    stats: [
      { title: 'Champion', value: 'Sahil — won 15–11 in the final' },
      { title: 'Comeback Blocked', value: 'Aryan Agarwal upset Atharv 17–15 in SF' },
    ],
    narrative: "Sahil dominated from the start and held off a spirited Aryan Agarwal 15–11 in the final to claim Kids Boys gold. Aryan had sprung the semi-final upset of the tournament — beating Atharv Singhal 17–15 in a tense 15-pt match. Sahil beat Vivaan Mishra 15–7 in his semi. Atharv claimed the bronze.",
    results: ['🥇 Final: Sahil 15–11 Aryan Agarwal', '🥈 Runner-up: Aryan Agarwal', '🥉 3rd: Atharv Singhal (bt Vivaan 15–3)'],
    resultsLabel: 'Final Results',
  },
  KGS: {
    gradient: 'from-pink-900 to-rose-900',
    stats: [
      { title: 'Champion', value: 'Maedhini S — won 15–10 in the final' },
      { title: 'SF Upset', value: 'Miraya bt top seed Pratyusha 21–8' },
    ],
    narrative: "Maedhini S made her mark with a dominant run — beating Ishita Deb 15–12 in the semis and then Miraya 15–10 in the final to claim the Kids Girls title. Miraya had sprung the biggest upset of the category, knocking out top-seeded Pratyusha 21–8 in the semis. Ishita Deb took the bronze, beating Pratyusha 21–17.",
    results: ['🥇 Final: Maedhini S 15–10 Miraya', '🥈 Runner-up: Miraya', '🥉 3rd: Ishita Deb (bt Pratyusha 21–17)'],
    resultsLabel: 'Final Results',
  },
}

function CategoryStory({ cat }: { cat: BadmintonCategory }) {
  const s = CATEGORY_STORIES[cat.id]
  if (!s) return null
  return (
    <div className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-5 text-white space-y-4 mt-3`}>
      <div className="flex flex-wrap gap-2">
        {s.stats.map((st) => (
          <div key={st.title} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2">
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wide mb-0.5">{st.title}</p>
            <p className="text-xs font-bold text-orange-300">{st.value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/75 leading-relaxed">{s.narrative}</p>
      <div>
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wide mb-2">{s.resultsLabel}</p>
        <div className="space-y-1.5">
          {s.results.map((line, i) => (
            <div key={i} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs font-medium text-white/90">
              {line}
            </div>
          ))}
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
  GA: 'bg-slate-100 text-slate-600',
  GB: 'bg-blue-50 text-blue-700',
  GC: 'bg-indigo-50 text-indigo-700',
  GD: 'bg-violet-50 text-violet-700',
  League: 'bg-teal-50 text-teal-700',
  QF:  'bg-amber-50 text-amber-700',
  SF:  'bg-orange-50 text-orange-700',
  '3P': 'bg-rose-50 text-rose-700',
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

function PodiumLine({ medal, label, name }: { medal: string; label: string; name: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
      <span className="text-base leading-none shrink-0">{medal}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
      </div>
    </div>
  )
}

function BadmintonTournamentPage({ t, badge, date, sportIcon = '🏸', showStories = true }: { t: ReturnType<typeof getTournament>; badge: { label: string; className: string }; date: string; sportIcon?: string; showStories?: boolean }) {
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
              <span className="text-4xl leading-none">{sportIcon}</span>
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

        {/* Winners summary — shown when results_summary is present (e.g. Table Tennis) */}
        {(() => {
          type ResultsCategory = { id: string; name: string; podium: { first: string | null; second: string | null; third: string | null } }
          type ResultsBlock = { title?: string; categories?: ResultsCategory[] }
          const results = (t as unknown as { results_summary?: ResultsBlock }).results_summary
          if (!results?.categories?.length) return null
          return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                  <span className="text-base leading-none">🎖️</span>
                  {results.title ?? 'Winners'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.categories.map((cat) => (
                  <div key={cat.id} className="border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{cat.id}</span>
                      <h3 className="text-sm font-bold text-slate-800">{cat.name}</h3>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      {cat.podium.first && (
                        <PodiumLine medal="🥇" label="Champion" name={cat.podium.first} />
                      )}
                      {cat.podium.second && (
                        <PodiumLine medal="🥈" label="Runner-up" name={cat.podium.second} />
                      )}
                      {cat.podium.third && (
                        <PodiumLine medal="🥉" label="3rd" name={cat.podium.third} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Rules — collapsible */}
        {t.content?.trim() && (
          <CollapsibleRules html={simpleMarkdownToHtml(t.content)} />
        )}

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

        {/* Category fixture grids with inline stories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} id={`cat-${cat.id}`}>
              <CategoryCard cat={cat} />
              {showStories && <CategoryStory cat={cat} />}
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

  if (t.sport === 'schedule') {
    type ScheduleWinner = { rank: string; entries: { name: string; apt?: string }[] }
    type ScheduleEvent = { name: string; age: string; start: string; end: string; report: string; note?: string; winners?: ScheduleWinner[] }
    type ScheduleVenue = { name: string; icon: string; events: ScheduleEvent[] }
    const schedule = t as unknown as { venues: ScheduleVenue[] }
    const venues = schedule.venues ?? []
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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl leading-none">📅</span>
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
          </div>

          {/* Venues */}
          {venues.map((venue) => (
            <div key={venue.name} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <span className="text-xl leading-none">{venue.icon}</span>
                <h2 className="font-bold text-slate-800">{venue.name}</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {venue.events.map((ev, i) => (
                  <div key={i} className="px-6 py-4 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{ev.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs bg-orange-50 border border-orange-100 text-orange-700 font-medium px-2 py-0.5 rounded-full">{ev.age}</span>
                          {ev.note && <span className="text-xs text-slate-400">{ev.note}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <div className="text-center">
                          <p className="text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Time</p>
                          <p className="font-bold text-slate-700">{ev.start} – {ev.end}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-center">
                          <p className="text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Report by</p>
                          <p className="font-bold text-orange-600">{ev.report}</p>
                        </div>
                      </div>
                    </div>

                    {/* Winners */}
                    {ev.winners && ev.winners.length > 0 && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Winners</p>
                        {ev.winners.map((w) => (
                          <div key={w.rank} className="flex items-start gap-3">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                              w.rank === 'Gold Medal' ? 'bg-amber-100 text-amber-800'
                              : w.rank === '1st' ? 'bg-orange-100 text-orange-700'
                              : w.rank === '2nd' ? 'bg-slate-200 text-slate-600'
                              : 'bg-rose-100 text-rose-700'
                            }`}>
                              {w.rank === 'Gold Medal' ? '🥇' : w.rank === '1st' ? '🥇' : w.rank === '2nd' ? '🥈' : '🥉'}
                              {w.rank}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {w.entries.map((e) => (
                                <span key={e.name} className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                  {e.name}
                                  {e.apt && <span className="text-slate-400 font-normal"> · {e.apt}</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    )
  }

  if (t.sport === 'badminton') {
    return <BadmintonTournamentPage t={t} badge={badge} date={date} />
  }

  if (t.sport === 'table-tennis') {
    return <BadmintonTournamentPage t={t} badge={badge} date={date} sportIcon="🏓" showStories={false} />
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
