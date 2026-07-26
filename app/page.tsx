import { getActiveEvents, getRegistrationCounts } from '@/actions/register'
import { isCulturalPasswordRequired } from '@/actions/culturalAccess'
import { getSiteContent, getCulturalRegistrationStatus, getCompetitiveRegistrationStatus } from '@/lib/content'
import RegistrationForm from '@/components/RegistrationForm'
import AnnouncementBar from '@/components/AnnouncementBar'
import CountdownBanner from '@/components/CountdownBanner'
import { Flag, Shield, ClipboardList, Trophy, Sparkles, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import MatchFlashCardLoader from '@/components/MatchFlashCardLoader'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [events, registrationCounts, culturalPasswordRequired, site] = await Promise.all([
    getActiveEvents(),
    getRegistrationCounts(),
    isCulturalPasswordRequired(),
    Promise.resolve(getSiteContent()),
  ])
  const culturalStatus    = getCulturalRegistrationStatus()
  const competitiveStatus = getCompetitiveRegistrationStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Nav */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/mplogo.png"
              alt="Meridian Park Logo"
              width={30}
              height={30}
              className="rounded-md shadow-sm object-contain"
            />
            <p className="font-bold text-slate-800 text-sm leading-tight hidden sm:block">{site.society_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/celebrate"
              className="flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-2.5 py-1.5 rounded-full transition-colors"
            >
              <Sparkles size={11} />
              Celebrate
            </Link>
            <Link
              href="/scores"
              className="flex items-center gap-1 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1.5 rounded-full transition-colors"
            >
              <Trophy size={11} />
              Scores
            </Link>
            <Link
              href="/status"
              className="hidden sm:flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors px-2 py-1.5"
            >
              <ClipboardList size={12} />
              Status
            </Link>
          </div>
        </div>
      </header>

      {/* Countdown — auto-hides at 8 PM IST */}
      <CountdownBanner />

      {/* Announcement banner */}
      <AnnouncementBar culturalStatus={culturalStatus} competitiveStatus={competitiveStatus} />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Flag size={12} />
          {site.event_badge}
        </div>

        {/* Event logo */}
        <div className="flex justify-center mb-5">
          <Image
            src="/event-logo.png"
            alt="Independence Day 2026 — TPC Meridian Park"
            width={300}
            height={222}
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
          {site.hero_heading
            .split(site.society_name)
            .flatMap((part, i, arr) =>
              i < arr.length - 1
                ? [
                    part,
                    <span
                      key={i}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"
                    >
                      {site.society_name}
                    </span>,
                  ]
                : [part]
            )}
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          {site.hero_subtext}
        </p>

        {/* Stats strip */}
        <div className="flex items-center justify-center gap-8 mt-8 py-5 px-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Stat label="Events" value={String(events.length)} />
          <div className="w-px h-8 bg-slate-200" />
          <Stat label={site.stat_activities_label} value={site.stat_activities_value} />
          <div className="w-px h-8 bg-slate-200" />
          <Stat label={site.stat_age_groups_label} value={site.stat_age_groups_value} />
        </div>
      </section>

      {/* Scores CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">
        <Link
          href="/scores"
          className="group flex items-center justify-between gap-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl px-6 py-4 shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl leading-none">🏆</span>
            <div>
              <p className="font-bold text-base leading-tight">Tournament Scores &amp; Rules</p>
              <p className="text-sm text-orange-100 mt-0.5">Live scores · Full schedules · Game rules · Livestream</p>
            </div>
          </div>
          <span className="text-orange-200 group-hover:translate-x-1 transition-transform text-xl font-bold shrink-0">→</span>
        </Link>
      </section>

      {/* Chess Results Flash Card */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-xs font-semibold text-amber-300 px-3 py-1 rounded-full">
              ♟ Chess · Champions Crowned
            </span>
            <Link
              href="/scores/chess-2026"
              className="text-xs text-slate-400 hover:text-white font-medium transition-colors shrink-0"
            >
              Full results →
            </Link>
          </div>

          <div className="space-y-3">
            {/* Age 10+ */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Age 10+</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-400/30 rounded-xl px-3 py-2.5">
                  <span className="text-base leading-none">🥇</span>
                  <span className="text-sm font-bold text-white">Aarush Pradish</span>
                </div>
                <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5">
                  <span className="text-base leading-none">🥈</span>
                  <span className="text-sm font-semibold text-slate-300">Samaira Agrawal</span>
                </div>
                <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5">
                  <span className="text-base leading-none">🥉</span>
                  <span className="text-sm font-semibold text-slate-400">Arjun Madiraju</span>
                </div>
              </div>
            </div>

            {/* Age up to 10 */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Age up to 10</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-400/30 rounded-xl px-3 py-2.5">
                  <span className="text-base leading-none">🥇</span>
                  <span className="text-sm font-bold text-white">Aviroon Das</span>
                </div>
                <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5">
                  <span className="text-base leading-none">🥈</span>
                  <span className="text-sm font-semibold text-slate-300">Evan Joe Jerin</span>
                </div>
                <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5">
                  <span className="text-base leading-none">🥉</span>
                  <span className="text-sm font-semibold text-slate-400">Avyaan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badminton Champions Flash Card */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-gradient-to-r from-orange-900 to-amber-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-xs font-semibold text-amber-200 px-3 py-1 rounded-full">
              🏸 Badminton · Champions Crowned
            </span>
            <Link
              href="/scores/badminton-2026"
              className="text-xs text-orange-300 hover:text-white font-medium transition-colors shrink-0"
            >
              Full results →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { cat: "Men's Singles",    gold: 'Manoj Shenoy',        silver: 'Shobhit Gupta',        bronze: 'Biswajeet Das' },
              { cat: "Women's Singles",  gold: 'Priyansha Verma',     silver: 'Sanghamitra Barman',   bronze: 'Ankita Pattnaik' },
              { cat: "Men's Doubles",    gold: 'Biswajeet + Manoj',   silver: 'Vijay + Abhishek',     bronze: 'Peeyush + Shobhit' },
              { cat: 'Mixed Doubles',    gold: 'Biswajeet + Ankita',  silver: 'Shobhit + Shruti',     bronze: 'Ketan + Komal' },
              { cat: 'Boys Singles',     gold: 'Ishan Deb',           silver: 'Tabish Ansari',        bronze: 'Ridhaan Vijayshekar' },
              { cat: 'Girls Singles',    gold: 'Shreya Shaanvi',      silver: 'Ashwika Gopu',         bronze: 'TBD' },
              { cat: 'Kids Boys',        gold: 'Sahil',               silver: 'Aryan Agarwal',        bronze: 'Atharv Singhal' },
              { cat: 'Kids Girls',       gold: 'Maedhini S',          silver: 'Miraya',               bronze: 'Ishita Deb' },
            ].map(r => (
              <div key={r.cat} className="bg-white/8 border border-white/10 rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-orange-300/70 font-bold uppercase tracking-wide mb-1.5">{r.cat}</p>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-white">🥇 {r.gold}</span>
                  <span className="text-xs text-white/60">🥈 {r.silver}</span>
                  <span className="text-xs text-white/40">🥉 {r.bronze}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Events — Aug 8–9 */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={15} className="text-green-200" />
            <span className="text-xs font-bold text-green-200 uppercase tracking-widest">Coming up</span>
          </div>
          <p className="text-lg font-extrabold mb-1">Independence Day Celebrations</p>
          <p className="text-sm text-green-100 mb-4">Cultural events, community programmes &amp; more — 8 &amp; 9 August 2026</p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/scores"
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            >
              <Trophy size={12} />
              All events &amp; rules
            </Link>
            <Link
              href="/celebrate"
              className="inline-flex items-center gap-1.5 bg-white text-green-700 hover:bg-green-50 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            >
              <Sparkles size={12} />
              Celebrate Jul 25–26
            </Link>
          </div>
        </div>
      </section>

      {/* Form Card */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-6 sm:p-8">
          <RegistrationForm events={events} site={site} culturalStatus={culturalStatus} competitiveStatus={competitiveStatus} registrationCounts={registrationCounts} culturalPasswordRequired={culturalPasswordRequired} />
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">{site.form_footer_note}</p>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-400">TPC Meridian Park · Independence Day 2026</p>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Shield size={12} />
          {site.admin_label}
        </Link>
      </footer>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}
