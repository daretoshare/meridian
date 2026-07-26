import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Trophy, Camera, Play, Heart, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

// ─── Data ────────────────────────────────────────────────────────────────────

type PodiumEntry = { rank: 1 | 2 | 3; name: string; note?: string; photo?: string }
type GroupStory = { gradient: string; stats: { title: string; value: string }[]; narrative: string; highlights: string[]; scoresLink: string }
type ChampionGroup = { label: string; podium: PodiumEntry[]; story?: GroupStory }
type ChampionSport = { sport: string; emoji: string; groups: ChampionGroup[] }

const CHAMPIONS: ChampionSport[] = [
  {
    sport: 'Chess',
    emoji: '♟',
    groups: [
      {
        label: 'Age 10+',
        podium: [
          { rank: 1, name: 'Aarush Pradish', note: 'Beat Samaira Agrawal via Armageddon', photo: undefined },
          { rank: 2, name: 'Samaira Agrawal', photo: undefined },
          { rank: 3, name: 'Arjun Madiraju', photo: undefined },
        ],
        story: {
          gradient: 'from-slate-900 to-slate-800',
          stats: [
            { title: 'Group A Undefeated', value: 'Arjun Madiraju — 4/4' },
            { title: 'Final decider', value: 'Armageddon tiebreak' },
          ],
          narrative: 'Arjun Madiraju swept Group A without dropping a point, while Nisha Bansal edged Group B in a dramatic draw against Samaira. The knockouts brought the real drama — Aarush dismantled Nisha 2–0, Samaira edged Arjun in Armageddon. The final mirrored the semi: Samaira won Round 1, Aarush levelled, then held his nerve in Armageddon to be crowned champion.',
          highlights: ['SF1: Aarush Pradish def. Nisha Bansal 2–0', 'SF2: Samaira Agrawal def. Arjun Madiraju 2–1 (Arma)', '3rd: Arjun Madiraju def. Nisha Bansal 2–0', 'Final: Aarush Pradish def. Samaira Agrawal 2–1 (Arma)'],
          scoresLink: '/scores/chess-2026',
        },
      },
      {
        label: 'Age up to 10',
        podium: [
          { rank: 1, name: 'Aviroon Das', note: 'Beat Evan Joe Jerin via Armageddon', photo: undefined },
          { rank: 2, name: 'Evan Joe Jerin', photo: undefined },
          { rank: 3, name: 'Avyaan', photo: undefined },
        ],
        story: {
          gradient: 'from-slate-800 to-slate-700',
          stats: [
            { title: 'Two perfect groups', value: 'Netik & Evan — 5/5 each' },
            { title: 'Upset of the day', value: 'Aviroon def. Netik in Armageddon' },
          ],
          narrative: 'Netik Chowdary and Evan Joe Jerin both went 5/5 in the group stage — the tournament seemed set for a blockbuster final between them. Aviroon Das had other ideas: he beat the group-stage leader Netik via Armageddon in the semis. Evan cruised past Avyaan 2–0. The final was a classic — Evan took Round 1, Aviroon levelled, then claimed Armageddon to become champion.',
          highlights: ['SF1: Aviroon Das def. Netik Chowdary 2–1 (Arma)', 'SF2: Evan Joe Jerin def. Avyaan 2–0', '3rd: Avyaan def. Netik Chowdary 2–0', 'Final: Aviroon Das def. Evan Joe Jerin 2–1 (Arma)'],
          scoresLink: '/scores/chess-2026',
        },
      },
    ],
  },
  {
    sport: 'Badminton',
    emoji: '🏸',
    groups: [
      {
        label: "Women's Singles",
        podium: [{ rank: 1, name: 'TBD' }, { rank: 2, name: 'TBD' }, { rank: 3, name: 'TBD' }],
        story: {
          gradient: 'from-indigo-900 to-purple-900',
          stats: [{ title: 'Clinical start', value: 'Priyansha Verma — 21–7 in QR1' }, { title: 'Deuce drama', value: 'Ankita bt Aakansha 23–21' }],
          narrative: "Priyansha Verma dispatched Nisha Bansal 21–7 to signal her intent, while Ankita Pattnaik survived a 23–21 deuce battle. Sanghamitra Barman advances to complete a strong semifinal field.",
          highlights: ['SF: Priyansha Verma vs Aakansha Baluni', 'SF: Ankita Pattnaik vs Sanghamitra Barman'],
          scoresLink: '/scores/badminton-2026#cat-WS',
        },
      },
      {
        label: "Men's Singles",
        podium: [{ rank: 1, name: 'TBD' }, { rank: 2, name: 'TBD' }, { rank: 3, name: 'TBD' }],
        story: {
          gradient: 'from-slate-900 to-slate-800',
          stats: [{ title: 'QR3 leader', value: 'Ketan Suthar — 3 rounds, 0 dropped' }, { title: 'Thriller', value: 'Gaurav C 23–21 Gaurav J' }],
          narrative: 'Ketan Suthar has been a wrecking ball — 21–5, 21–14, 21–4 across three qualifying rounds. Manoj Shenoy upset Gaurav Chakravorty 21–4 in QR2. QR3 deciders will set the semifinal field.',
          highlights: ['SF: Ketan Suthar vs QR3 winner', 'SF: TBD vs TBD'],
          scoresLink: '/scores/badminton-2026#cat-MS',
        },
      },
      {
        label: "Men's Doubles",
        podium: [{ rank: 1, name: 'TBD' }, { rank: 2, name: 'TBD' }, { rank: 3, name: 'TBD' }],
        story: {
          gradient: 'from-blue-900 to-cyan-900',
          stats: [{ title: 'Closest match', value: 'Nishant+Rajeev 23–21 vs Anshu+Ankit' }, { title: 'Strong pair', value: 'Peeyush+Shobhit — No.1 seed' }],
          narrative: 'The doubles draw threw up drama from the start — Nishant and Rajeev survived a 23–21 thriller. Peeyush and Shobhit look the pair to beat heading into the semis.',
          highlights: ['SF: Peeyush+Shobhit vs Biswajeet+Manoj', 'SF: Nishant+Rajeev vs Vijay+Abhishek'],
          scoresLink: '/scores/badminton-2026#cat-MD',
        },
      },
      {
        label: 'Mixed Doubles',
        podium: [{ rank: 1, name: 'TBD' }, { rank: 2, name: 'TBD' }, { rank: 3, name: 'TBD' }],
        story: {
          gradient: 'from-rose-900 to-pink-900',
          stats: [{ title: 'Top seed', value: 'Ketan+Komal — commanding run' }, { title: 'Rivals', value: 'Shobhit+Shruti — strong challengers' }],
          narrative: 'Mixed doubles produced tight battles through qualifying. The two headline pairs — Ketan+Komal and Shobhit+Shruti — set up a mouth-watering semifinal showdown.',
          highlights: ['SF: Ketan+Komal vs Biswajeet+Ankita', 'SF: Shobhit+Shruti vs Priyansha+Prashant'],
          scoresLink: '/scores/badminton-2026#cat-MID',
        },
      },
      {
        label: 'Boys Singles (10–16)',
        podium: [{ rank: 1, name: 'TBD' }, { rank: 2, name: 'TBD' }, { rank: 3, name: 'TBD' }],
        story: {
          gradient: 'from-green-900 to-emerald-900',
          stats: [{ title: 'Top seed', value: 'Ishan Deb — strong qualifying run' }, { title: 'Repêchage hero', value: 'Tabish Ansari — comeback win' }],
          narrative: 'Ishan Deb and Ridhaan looked commanding through qualifying. Tabish Ansari produced the best comeback — losing early before returning through the repêchage to claim a semifinal spot.',
          highlights: ['SF: Ishan Deb vs Arshit', 'SF: Ridhaan vs Tabish Ansari'],
          scoresLink: '/scores/badminton-2026#cat-BS',
        },
      },
      {
        label: 'Girls Singles (10–16)',
        podium: [{ rank: 1, name: 'TBD' }, { rank: 2, name: 'TBD' }, { rank: 3, name: 'TBD' }],
        story: {
          gradient: 'from-fuchsia-900 to-violet-900',
          stats: [{ title: 'Dominant display', value: 'Yuvika Gupta — 21–0 walkover' }, { title: 'Upset of Day 1', value: 'Shreya Shaanvi bt Samaira 15–8' }],
          narrative: "Yuvika Gupta announced herself with a 21–0 win. Shreya Shaanvi pulled off the day's big upset, beating Samaira Agrawal 15–8. Ashwika vs Yuvika shapes up as the blockbuster semifinal clash.",
          highlights: ['SF: Saanvi Agrawal vs Shreya Shaanvi', 'SF: Ashwika Gopu vs Yuvika Gupta'],
          scoresLink: '/scores/badminton-2026#cat-GS',
        },
      },
      {
        label: 'Kids Boys (5–10)',
        podium: [{ rank: 1, name: 'TBD' }, { rank: 2, name: 'TBD' }, { rank: 3, name: 'TBD' }],
        story: {
          gradient: 'from-amber-900 to-orange-900',
          stats: [{ title: 'Comeback kid', value: 'Vivaan Mishra — lost QR1, won QR2' }, { title: 'Sharp shooter', value: 'Sahil — 15–8, 15–10 clean wins' }],
          narrative: 'Vivaan Mishra lost to Sahil in QR1, returned through the second chance to win his berth — and now faces Sahil again in the semis. A rematch the kids\' court can\'t wait for.',
          highlights: ['SF: Sahil vs Vivaan Mishra', 'SF: Atharv Singhal vs Aryan Agarwal'],
          scoresLink: '/scores/badminton-2026#cat-KBS',
        },
      },
      {
        label: 'Kids Girls (5–10)',
        podium: [{ rank: 1, name: 'TBD' }, { rank: 2, name: 'TBD' }, { rank: 3, name: 'TBD' }],
        story: {
          gradient: 'from-pink-900 to-rose-900',
          stats: [{ title: 'Top seeds', value: 'Pratyusha vs Miraya — final matchup' }, { title: 'Exciting final', value: 'Maedhini S vs Ishita Deb' }],
          narrative: 'The youngest category delivered some of the most exciting play of the day. Pratyusha and Miraya headline one semi, with Maedhini and Ishita on the other side.',
          highlights: ['SF: Pratyusha vs Miraya', 'SF: Maedhini S vs Ishita Deb'],
          scoresLink: '/scores/badminton-2026#cat-KGS',
        },
      },
    ],
  },
]

const PHOTO_PLACEHOLDERS: { id: number; label: string; aspect: 'wide' | 'tall'; src?: string }[] = [
  { id: 1, label: 'Opening ceremony', aspect: 'tall' },
  { id: 2, label: 'Chess — Group A in action', aspect: 'wide' },
  { id: 3, label: 'Badminton — Kids finals', aspect: 'tall' },
  { id: 4, label: 'Trophy presentation', aspect: 'wide' },
  { id: 5, label: 'Badminton — Men\'s Singles SF', aspect: 'tall' },
  { id: 6, label: 'Chess — Age up to 10 semifinals', aspect: 'wide' },
  { id: 7, label: 'Candids — participants', aspect: 'tall' },
  { id: 8, label: 'Closing ceremony', aspect: 'wide' },
  { id: 9, label: 'Winners podium', aspect: 'tall' },
  // To add a photo: add src: 'https://lh3.googleusercontent.com/d/YOUR_FILE_ID'
  // Get FILE_ID from the Drive share link: drive.google.com/file/d/FILE_ID/view
]

const VIDEO_PLACEHOLDERS = [
  { id: 1, label: 'Inaugural ceremony highlights', duration: '3:24', url: 'https://drive.google.com/drive/folders/1Du4ZaNj38WJgJkzDXlvcaZccKZ0C6MS2' },
  { id: 2, label: "Badminton — Men's Doubles final", duration: 'Coming soon', url: null },
  { id: 3, label: "Chess — Age 10+ semifinal", duration: 'Coming soon', url: null },
  { id: 4, label: 'Kids Badminton — best rallies', duration: 'Coming soon', url: null },
]

const SPONSORS: {
  tier: 'title' | 'gold' | 'community'
  name: string
  tagline?: string
}[] = [
  { tier: 'title', name: 'Prestige Group', tagline: 'Platinum partner · TPC Meridian Park' },
  { tier: 'gold', name: 'Sponsor Name', tagline: 'Gold partner' },
  { tier: 'gold', name: 'Sponsor Name', tagline: 'Gold partner' },
  { tier: 'community', name: 'Community Supporter' },
  { tier: 'community', name: 'Community Supporter' },
  { tier: 'community', name: 'Community Supporter' },
]

// ─── Components ───────────────────────────────────────────────────────────────

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-20" />
}

// ─── Podium components ───────────────────────────────────────────────────────

const RANK_CONFIG = {
  1: {
    medal: '🥇',
    label: 'Champion',
    bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    border: 'border-amber-300',
    avatarBg: 'bg-amber-200',
    avatarIcon: 'text-amber-600',
    nameCls: 'text-white text-xl font-extrabold',
    labelCls: 'text-amber-100 text-xs font-bold uppercase tracking-widest',
    noteCls: 'text-amber-100/80 text-xs',
    avatarSize: 'w-20 h-20',
    iconSize: 28,
    cardCls: 'col-span-2',
  },
  2: {
    medal: '🥈',
    label: 'Runner-up',
    bg: 'bg-gradient-to-br from-slate-600 to-slate-700',
    border: 'border-slate-500',
    avatarBg: 'bg-slate-500',
    avatarIcon: 'text-slate-300',
    nameCls: 'text-white text-base font-bold',
    labelCls: 'text-slate-400 text-[10px] font-bold uppercase tracking-widest',
    noteCls: 'text-slate-400 text-[10px]',
    avatarSize: 'w-14 h-14',
    iconSize: 20,
    cardCls: 'col-span-1',
  },
  3: {
    medal: '🥉',
    label: '3rd Place',
    bg: 'bg-gradient-to-br from-orange-800 to-amber-900',
    border: 'border-orange-700',
    avatarBg: 'bg-orange-700',
    avatarIcon: 'text-orange-300',
    nameCls: 'text-white text-base font-bold',
    labelCls: 'text-orange-300/70 text-[10px] font-bold uppercase tracking-widest',
    noteCls: 'text-orange-200/60 text-[10px]',
    avatarSize: 'w-14 h-14',
    iconSize: 20,
    cardCls: 'col-span-1',
  },
} as const

function PodiumCard({ entry }: { entry: PodiumEntry }) {
  const cfg = RANK_CONFIG[entry.rank]
  const isTBD = entry.name === 'TBD'
  return (
    <div className={`${cfg.cardCls} ${cfg.bg} border ${cfg.border} rounded-2xl p-5 flex flex-col gap-3`}>
      {/* Medal + label row */}
      <div className="flex items-center justify-between">
        <span className="text-2xl leading-none">{cfg.medal}</span>
        <span className={cfg.labelCls}>{cfg.label}</span>
      </div>
      {/* Avatar */}
      <div className={`${cfg.avatarSize} rounded-full ${cfg.avatarBg} border-2 ${cfg.border} flex items-center justify-center overflow-hidden`}>
        {entry.photo ? (
          <Image src={entry.photo} alt={entry.name} width={80} height={80} className="object-cover w-full h-full" />
        ) : (
          <Trophy size={cfg.iconSize} className={cfg.avatarIcon} />
        )}
      </div>
      {/* Name */}
      {isTBD ? (
        <p className={`${cfg.nameCls} opacity-40`}>TBD</p>
      ) : (
        <p className={cfg.nameCls}>{entry.name}</p>
      )}
      {/* Note */}
      {entry.note && !isTBD && (
        <p className={cfg.noteCls}>{entry.note}</p>
      )}
    </div>
  )
}

function PodiumGroup({ group }: { group: ChampionGroup }) {
  const gold   = group.podium.find(p => p.rank === 1)!
  const silver = group.podium.find(p => p.rank === 2)!
  const bronze = group.podium.find(p => p.rank === 3)!
  const s = group.story
  return (
    <div className="space-y-3">
      {/* Group label */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">{group.label}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      {/* Podium: champion spans full width (col-span-2), silver+bronze side by side */}
      <div className="grid grid-cols-2 gap-3">
        <PodiumCard entry={gold} />
        <PodiumCard entry={silver} />
        <PodiumCard entry={bronze} />
      </div>
      {/* Inline story */}
      {s && (
        <div className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-5 text-white space-y-3`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Tournament story</p>
            <Link href={s.scoresLink} className="text-[10px] text-orange-300 hover:text-white transition-colors font-medium shrink-0">
              Full draw →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {s.stats.map((st) => (
              <div key={st.title} className="bg-white/10 border border-white/15 rounded-xl px-3 py-2">
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wide mb-0.5">{st.title}</p>
                <p className="text-xs font-bold text-orange-300">{st.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/70 leading-relaxed">{s.narrative}</p>
          <div className="space-y-1.5">
            {s.highlights.map((h, i) => (
              <div key={i} className="bg-white/8 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium text-white/80">
                {h}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PhotoPlaceholder({ label, aspect, src }: { label: string; aspect: 'wide' | 'tall'; src?: string }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden border ${aspect === 'tall' ? 'row-span-2' : ''} ${src ? 'border-slate-300 bg-black' : 'bg-slate-100 border-slate-200'}`}>
      {src ? (
        <>
          <Image src={src} alt={label} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
            <p className="text-xs text-white/90 leading-snug">{label}</p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
          <Camera size={24} className="text-slate-300" />
          <p className="text-xs text-slate-400 leading-snug">{label}</p>
          <span className="text-[10px] text-slate-300 bg-slate-200 px-2 py-0.5 rounded-full">Photo coming soon</span>
        </div>
      )}
      <div className={`${aspect === 'tall' ? 'pb-[200%]' : 'pb-[56%]'}`} />
    </div>
  )
}

function VideoCard({ video, featured }: { video: typeof VIDEO_PLACEHOLDERS[0]; featured?: boolean }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 ${featured ? 'col-span-full aspect-video' : 'aspect-video'}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <Play size={22} className="text-white ml-1" />
        </div>
        <div>
          <p className={`font-semibold text-white ${featured ? 'text-base' : 'text-sm'}`}>{video.label}</p>
          <p className="text-xs text-slate-400 mt-1">{video.duration}</p>
        </div>
        {video.url ? (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            Open in Drive →
          </a>
        ) : (
          <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">Upload pending</span>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CelebratePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">

      {/* Sticky nav */}
      <header className="border-b border-white/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={14} />
            Home
          </Link>
          <div className="flex items-center gap-4 overflow-x-auto text-xs font-medium text-slate-500 hide-scrollbar">
            <a href="#champions" className="hover:text-slate-800 transition-colors shrink-0">Champions</a>
            <a href="#gallery" className="hover:text-slate-800 transition-colors shrink-0">Gallery</a>
            <a href="#highlights" className="hover:text-slate-800 transition-colors shrink-0">Highlights</a>
            <a href="#sponsors" className="hover:text-slate-800 transition-colors shrink-0">Sponsors</a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-16">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Star size={12} />
            Independence Day 2026 · TPC Meridian Park
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            A day to remember
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
            Chess, badminton, community — and the spirit of 15 August. Here&apos;s everything from the day.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <a
              href="https://drive.google.com/drive/folders/1Du4ZaNj38WJgJkzDXlvcaZccKZ0C6MS2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            >
              <Camera size={13} />
              View Drive folder
            </a>
            <Link
              href="/scores"
              className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            >
              <Trophy size={13} />
              Full results
            </Link>
          </div>
        </div>

        {/* ── Champions ────────────────────────────────────────────────── */}
        <section>
          <SectionAnchor id="champions" />
          <div className="flex items-center gap-3 mb-8">
            <Trophy size={18} className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Champions</h2>
          </div>

          <div className="space-y-12">
            {CHAMPIONS.map((sport) => (
              <div key={sport.sport}>
                {/* Sport header */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{sport.emoji}</span>
                  <h3 className="text-lg font-extrabold text-slate-800">{sport.sport}</h3>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                {/* Groups */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {sport.groups.map((group) => (
                    <PodiumGroup key={group.label} group={group} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Gallery ──────────────────────────────────────────────────── */}
        <section>
          <SectionAnchor id="gallery" />
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Camera size={18} className="text-orange-500" />
              <h2 className="text-xl font-extrabold text-slate-900">Gallery</h2>
            </div>
            <a
              href="https://drive.google.com/drive/folders/1Du4ZaNj38WJgJkzDXlvcaZccKZ0C6MS2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              Open Drive →
            </a>
          </div>

          {/* Filter chips — decorative, no filter logic until photos land */}
          <div className="flex flex-wrap gap-2 mb-5">
            {['All', 'Chess', 'Badminton', 'Ceremony', 'Candids'].map((f, i) => (
              <button
                key={f}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${i === 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-[140px]">
            {PHOTO_PLACEHOLDERS.map((p) => (
              <PhotoPlaceholder key={p.id} label={p.label} aspect={p.aspect} src={p.src} />
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center mt-4">
            Photos will appear here once uploaded to the{' '}
            <a href="https://drive.google.com/drive/folders/1Du4ZaNj38WJgJkzDXlvcaZccKZ0C6MS2" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
              Drive folder
            </a>.
          </p>
        </section>

        {/* ── Video highlights ─────────────────────────────────────────── */}
        <section>
          <SectionAnchor id="highlights" />
          <div className="flex items-center gap-3 mb-6">
            <Play size={18} className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Highlights</h2>
          </div>

          {/* Featured video */}
          <VideoCard video={VIDEO_PLACEHOLDERS[0]} featured />

          {/* Playlist row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {VIDEO_PLACEHOLDERS.slice(1).map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>


        {/* ── Sponsors ─────────────────────────────────────────────────── */}
        <section>
          <SectionAnchor id="sponsors" />
          <div className="flex items-center gap-3 mb-6">
            <Heart size={18} className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-slate-900">With thanks to our sponsors</h2>
          </div>

          {/* Title sponsor */}
          {SPONSORS.filter((s) => s.tier === 'title').map((s) => (
            <div key={s.name} className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-4 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-20 h-20 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0">
                <span className="text-xs text-slate-300 font-medium text-center leading-snug">Logo<br />here</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Title sponsor</span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{s.name}</h3>
                {s.tagline && <p className="text-sm text-slate-500 mt-0.5">{s.tagline}</p>}
              </div>
            </div>
          ))}

          {/* Gold sponsors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {SPONSORS.filter((s) => s.tier === 'gold').map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-slate-300">Logo</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gold partner</span>
                  <p className="font-bold text-slate-700 text-sm mt-0.5">{s.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Community supporters */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Community supporters</p>
            <div className="flex flex-wrap gap-2">
              {SPONSORS.filter((s) => s.tier === 'community').map((s, i) => (
                <span key={i} className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-4">
            Interested in sponsoring future events?{' '}
            <a href="/" className="text-orange-500 hover:underline">Get in touch →</a>
          </p>
        </section>

        {/* Footer pad */}
        <div className="pb-8" />
      </main>
    </div>
  )
}
