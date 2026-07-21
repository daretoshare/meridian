import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface Game {
  white: string
  black: string
  result: string | null
}

export interface Round {
  round: number
  bye?: string
  games: Game[]
}

export interface Standing {
  name: string
  pts: number
  games: number
  wins: number
}

export interface KnockoutMatch {
  id?: string
  label: string
  player1: string | null
  player2: string | null
  result: string | null
}

export interface Tournament {
  slug: string
  title: string
  subtitle: string
  sport: string
  status: 'upcoming' | 'ongoing' | 'completed'
  live_stream_url: string
  event_date: string
  event_time?: string
  time_controls: {
    groups: string
    semifinals: string
    final: string
    third_place: string
  }
  scoring: {
    win: number
    draw: number
    loss: number
    bye: number
  }
  tiebreaks: string[]
  participants: Array<{
    name: string
    location: string
    apt: string
  }>
  groups: Record<string, string[]>
  schedule: {
    group_a: Round[]
    group_b: Round[]
  }
  knockout: {
    semifinals: KnockoutMatch[]
    final: KnockoutMatch
    third_place: KnockoutMatch
  }
  content: string
}

const SCORES_DIR = path.join(process.cwd(), 'content', 'scores')

export function getTournament(slug: string): Tournament {
  const filePath = path.join(SCORES_DIR, `${slug}.md`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { ...(data as Omit<Tournament, 'slug' | 'content'>), slug, content }
}

export function listTournaments(): Array<{
  slug: string
  title: string
  sport: string
  status: string
  event_date: string
  event_time?: string
  live_stream_url: string
}> {
  if (!fs.existsSync(SCORES_DIR)) return []
  const files = fs.readdirSync(SCORES_DIR).filter((f) => f.endsWith('.md'))
  return files.map((file) => {
    const slug = file.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(SCORES_DIR, file), 'utf-8')
    const { data } = matter(raw)
    return {
      slug,
      title: data.title as string,
      sport: data.sport as string,
      status: data.status as string,
      event_date: data.event_date as string,
      event_time: (data.event_time as string | undefined) ?? undefined,
      live_stream_url: data.live_stream_url as string,
    }
  })
}

export function computeStandings(
  group: string[],
  rounds: Round[],
  byePts = 1,
): Standing[] {
  const pts: Record<string, number> = {}
  const games: Record<string, number> = {}
  const wins: Record<string, number> = {}

  for (const name of group) {
    pts[name] = 0
    games[name] = 0
    wins[name] = 0
  }

  for (const round of rounds) {
    // Bye
    if (round.bye && group.includes(round.bye)) {
      pts[round.bye] += byePts
      // byes don't count as a played game
    }

    for (const game of round.games) {
      const { white, black, result } = game
      if (!result) continue

      if (group.includes(white)) games[white]++
      if (group.includes(black)) games[black]++

      if (result === '1-0') {
        if (group.includes(white)) { pts[white] += 1; wins[white]++ }
        if (group.includes(black)) pts[black] += 0
      } else if (result === '0-1') {
        if (group.includes(white)) pts[white] += 0
        if (group.includes(black)) { pts[black] += 1; wins[black]++ }
      } else if (result === '0.5-0.5') {
        if (group.includes(white)) pts[white] += 0.5
        if (group.includes(black)) pts[black] += 0.5
      }
    }
  }

  return group
    .map((name) => ({ name, pts: pts[name], games: games[name], wins: wins[name] }))
    .sort((a, b) => b.pts - a.pts || b.wins - a.wins)
}
