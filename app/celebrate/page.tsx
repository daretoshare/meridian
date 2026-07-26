import Link from 'next/link'
import { ArrowLeft, Trophy, Camera, Play, Quote, Heart, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

// ─── Data ────────────────────────────────────────────────────────────────────

const CHAMPIONS = [
  {
    sport: 'Chess',
    emoji: '♟',
    categories: [
      { label: 'Age 10+ Champion', winner: 'TBD', finalist: 'Final today', note: 'Arjun M. vs Nisha B. / Aarush P.' },
      { label: 'Age 10+ Runner-up', winner: 'TBD', finalist: '', note: '' },
      { label: 'Age up to 10 Champion', winner: 'TBD', finalist: 'Final today', note: 'Netik C. vs Evan J. / Avyaan' },
      { label: 'Age up to 10 Runner-up', winner: 'TBD', finalist: '', note: '' },
    ],
  },
  {
    sport: 'Badminton',
    emoji: '🏸',
    categories: [
      { label: "Women's Singles", winner: 'TBD', finalist: 'SF today', note: 'Priyansha V. vs Ankita P.' },
      { label: "Men's Singles", winner: 'TBD', finalist: 'QR3 + SF today', note: 'Ketan Suthar leads' },
      { label: "Men's Doubles", winner: 'TBD', finalist: 'SF today', note: 'Biswajeet+Manoj vs Vijay+Abhishek' },
      { label: 'Mixed Doubles', winner: 'TBD', finalist: 'SF today', note: 'Ketan+Komal vs Shobhit+Shruti' },
      { label: 'Boys Singles 10–16', winner: 'TBD', finalist: 'SF today', note: 'Ishan D. vs Ridhaan V.' },
      { label: 'Girls Singles 10–16', winner: 'TBD', finalist: 'SF today', note: 'Saanvi A. vs Ashwika G.' },
      { label: 'Kids Boys Singles 5–10', winner: 'TBD', finalist: 'Final today', note: 'Sahil vs Atharv S.' },
      { label: 'Kids Girls Singles 5–10', winner: 'TBD', finalist: 'Final today', note: 'Pratyusha vs Maedhini S.' },
    ],
  },
]

const PHOTO_PLACEHOLDERS = [
  { id: 1, label: 'Opening ceremony', aspect: 'tall' },
  { id: 2, label: 'Chess — Group A in action', aspect: 'wide' },
  { id: 3, label: 'Badminton — Kids finals', aspect: 'tall' },
  { id: 4, label: 'Trophy presentation', aspect: 'wide' },
  { id: 5, label: 'Badminton — Men\'s Singles SF', aspect: 'tall' },
  { id: 6, label: 'Chess — Age up to 10 semifinals', aspect: 'wide' },
  { id: 7, label: 'Candids — participants', aspect: 'tall' },
  { id: 8, label: 'Closing ceremony', aspect: 'wide' },
  { id: 9, label: 'Winners podium', aspect: 'tall' },
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

const STORIES = [
  {
    id: 'chess-10plus',
    sport: 'Chess · Age 10+',
    gradient: 'from-slate-900 to-slate-800',
    stats: [
      { title: 'Group A Dominant', value: 'Arjun Madiraju — 4/4 · Undefeated' },
      { title: 'Group B Winner', value: 'Nisha Bansal — 2.5/3' },
    ],
    narrative: 'Group A was a masterclass in precision — Arjun Madiraju swept every board, allowing zero points to opponents. Aarush Pradish held firm for second. Group B brought drama: Nisha Bansal held Samaira to a draw while taking the title, with Samaira earning her semifinal berth on consistency.',
    sf: ['Nisha Bansal vs Aarush Pradish', 'Arjun Madiraju vs Samaira Agrawal'],
    link: '/scores/chess-2026',
  },
  {
    id: 'chess-u10',
    sport: 'Chess · Age up to 10',
    gradient: 'from-slate-800 to-slate-700',
    stats: [
      { title: 'Group A Unstoppable', value: 'Netik Chowdary — 5/5 · Perfect' },
      { title: 'Group B Unstoppable', value: 'Evan Joe Jerin — 5/5 · Perfect' },
    ],
    narrative: 'Two perfect group stage campaigns — Netik Chowdary and Evan Joe Jerin both went 5/5 in their respective groups without dropping a point. Aviroon Das (4 pts) and Avyaan (4 pts) claimed the second semifinal spots. The knockout stage sets up the clash the community has been waiting for.',
    sf: ['Netik Chowdary vs Aviroon Das', 'Evan Joe Jerin vs Avyaan'],
    link: '/scores/chess-2026',
  },
  {
    id: 'badminton-ms',
    sport: 'Badminton · Men\'s Singles',
    gradient: 'from-slate-900 to-slate-800',
    stats: [
      { title: 'QR3 Leader', value: 'Ketan Suthar — 3 rounds, 0 dropped' },
      { title: 'Day 1 Thriller', value: 'Gaurav C 23–21 Gaurav J — deuce drama' },
    ],
    narrative: 'Ketan Suthar (510201) has been a wrecking ball — 21–5, 21–14, 21–4 across three qualifying rounds. Manoj Shenoy upset Gaurav Chakravorty 21–4 in QR2. Two QR3 deciders will set the semifinal field. Ketan awaits.',
    sf: ['Ketan Suthar vs QR3 winner', 'TBD vs TBD'],
    link: '/scores/badminton-2026#cat-MS',
  },
  {
    id: 'badminton-kbs',
    sport: 'Badminton · Kids Boys Singles',
    gradient: 'from-amber-900 to-orange-900',
    stats: [
      { title: 'Comeback Kid', value: 'Vivaan Mishra — lost QR1, won QR2' },
      { title: 'Sharp Shooter', value: 'Sahil — 15–8, 15–10 · two clean wins' },
    ],
    narrative: "Vivaan Mishra lost 8–15 to Sahil in QR1, yet returned to beat Darshit 15–9 and win his second-chance berth. Now he faces Sahil again in the semifinal — a rematch the kids' court can't wait for.",
    sf: ['Sahil vs Vivaan Mishra', 'Atharv Singhal vs Aryan Agarwal'],
    link: '/scores/badminton-2026#cat-KBS',
  },
  {
    id: 'badminton-ws',
    sport: 'Badminton · Women\'s Singles',
    gradient: 'from-indigo-900 to-purple-900',
    stats: [
      { title: 'Clinical Start', value: 'Priyansha Verma — 21–7 in QR1' },
      { title: 'Deuce Drama', value: 'Ankita bt Aakansha 23–21' },
    ],
    narrative: "Priyansha Verma dispatched Nisha Bansal 21–7 to signal her intent, while Ankita Pattnaik survived a 23–21 deuce battle. Sanghamitra Barman advances to complete a strong semifinal field.",
    sf: ['Priyansha Verma vs Aakansha Baluni', 'Ankita Pattnaik vs Sanghamitra Barman'],
    link: '/scores/badminton-2026#cat-WS',
  },
  {
    id: 'badminton-gs',
    sport: 'Badminton · Girls Singles 10–16',
    gradient: 'from-fuchsia-900 to-violet-900',
    stats: [
      { title: 'Dominant Display', value: 'Yuvika Gupta — 21–0 walkover' },
      { title: 'Upset of the Day', value: 'Shreya Shaanvi bt Samaira 15–8' },
    ],
    narrative: "Yuvika Gupta announced herself with a 21–0 win. Shreya Shaanvi pulled off the day's big upset, beating Samaira Agrawal 15–8. Ashwika Gopu vs Yuvika shapes up as the blockbuster semifinal clash.",
    sf: ['Saanvi Agrawal vs Shreya Shaanvi', 'Ashwika Gopu vs Yuvika Gupta'],
    link: '/scores/badminton-2026#cat-GS',
  },
]

// ─── Components ───────────────────────────────────────────────────────────────

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-20" />
}

function PhotoPlaceholder({ label, aspect }: { label: string; aspect: 'wide' | 'tall' }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 ${aspect === 'tall' ? 'row-span-2' : ''}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
        <Camera size={24} className="text-slate-300" />
        <p className="text-xs text-slate-400 leading-snug">{label}</p>
        <span className="text-[10px] text-slate-300 bg-slate-200 px-2 py-0.5 rounded-full">Photo coming soon</span>
      </div>
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

function StoryCard({ story }: { story: typeof STORIES[0] }) {
  return (
    <div className={`bg-gradient-to-br ${story.gradient} rounded-2xl p-5 text-white space-y-4`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-white/60 uppercase tracking-wide">{story.sport}</p>
        <Link href={story.link} className="text-[10px] text-orange-300 hover:text-white transition-colors font-medium">
          Full draw →
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {story.stats.map((st) => (
          <div key={st.title} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2">
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wide mb-0.5">{st.title}</p>
            <p className="text-xs font-bold text-orange-300">{st.value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/75 leading-relaxed">{story.narrative}</p>
      <div>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-2">Semifinals</p>
        <div className="space-y-1.5">
          {story.sf.map((match, i) => (
            <div key={i} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs font-medium text-white/90">
              {match}
            </div>
          ))}
        </div>
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
            <a href="#stories" className="hover:text-slate-800 transition-colors shrink-0">Stories</a>
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
          <div className="flex items-center gap-3 mb-6">
            <Trophy size={18} className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Champions</h2>
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Finals today</span>
          </div>

          <div className="space-y-8">
            {CHAMPIONS.map((sport) => (
              <div key={sport.sport}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{sport.emoji}</span>
                  <h3 className="font-bold text-slate-700 text-sm">{sport.sport}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {sport.categories.map((cat) => (
                    <div key={cat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{cat.label}</p>
                      {cat.winner === 'TBD' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                              <Trophy size={14} className="text-slate-300" />
                            </div>
                            <span className="text-sm font-bold text-slate-300">TBD</span>
                          </div>
                          {cat.finalist && (
                            <p className="text-[10px] text-orange-500 font-medium">{cat.finalist}</p>
                          )}
                          {cat.note && (
                            <p className="text-[10px] text-slate-400 leading-snug">{cat.note}</p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Trophy size={14} className="text-amber-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-800">{cat.winner}</span>
                        </div>
                      )}
                    </div>
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
              <PhotoPlaceholder key={p.id} label={p.label} aspect={p.aspect} />
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

        {/* ── Stories ──────────────────────────────────────────────────── */}
        <section>
          <SectionAnchor id="stories" />
          <div className="flex items-center gap-3 mb-6">
            <Quote size={18} className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Tournament stories</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {STORIES.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>

          {/* Community voice placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
              <Quote size={18} className="text-orange-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Share your moment</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Did you play, cheer, or organise? We&apos;d love to hear your story from Independence Day 2026.
            </p>
            <a
              href="https://drive.google.com/drive/folders/1Du4ZaNj38WJgJkzDXlvcaZccKZ0C6MS2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            >
              Submit your story
            </a>
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
