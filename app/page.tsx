import { getActiveEvents, getRegistrationCounts } from '@/actions/register'
import { isCulturalPasswordRequired } from '@/actions/culturalAccess'
import { getSiteContent, getCulturalRegistrationStatus, getCompetitiveRegistrationStatus } from '@/lib/content'
import RegistrationForm from '@/components/RegistrationForm'
import AnnouncementBar from '@/components/AnnouncementBar'
import CountdownBanner from '@/components/CountdownBanner'
import { Flag, Shield, ClipboardList, Trophy } from 'lucide-react'
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
      <header className="border-b border-white/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/mplogo.png"
              alt="Meridian Park Logo"
              width={36}
              height={36}
              className="rounded-lg shadow-sm object-contain"
            />
            <div>
              <p className="font-bold text-slate-800 leading-tight">{site.society_name}</p>
              <p className="text-xs text-slate-500">{site.society_subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/scores"
              className="flex items-center gap-1.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-full transition-colors shadow-sm"
            >
              <Trophy size={13} />
              Scores &amp; Rules
            </Link>
            <Link
              href="/status"
              className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors"
            >
              <ClipboardList size={14} />
              Check Registration Status
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Shield size={14} />
              {site.admin_label}
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

      {/* Match Flash Card */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">
        <MatchFlashCardLoader />
      </section>

      {/* Chess Semifinals Flash Card */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-xs font-semibold text-orange-300 px-3 py-1 rounded-full">
              ♟ Chess · Semifinals Set
            </span>
            <Link
              href="/scores/chess-2026"
              className="text-xs text-slate-400 hover:text-white font-medium transition-colors shrink-0"
            >
              View draw →
            </Link>
          </div>

          <div className="space-y-3">
            {/* Age 10+ */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Age 10+</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-semibold text-white">Nisha Bansal</span>
                  <span className="text-xs font-bold text-orange-400 mx-1">VS</span>
                  <span className="text-sm font-semibold text-white">Aarush Pradish</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-semibold text-white">Arjun Madiraju</span>
                  <span className="text-xs font-bold text-orange-400 mx-1">VS</span>
                  <span className="text-sm font-semibold text-white">Samaira Agrawal</span>
                </div>
              </div>
            </div>

            {/* Age up to 10 */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Age up to 10</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-semibold text-white">Netik Chowdary</span>
                  <span className="text-xs font-bold text-orange-400 mx-1">VS</span>
                  <span className="text-sm font-semibold text-white">Aviroon Das</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-semibold text-white">Evan Joe Jerin</span>
                  <span className="text-xs font-bold text-orange-400 mx-1">VS</span>
                  <span className="text-sm font-semibold text-white">Avyaan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badminton Semifinals Flash Card */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-gradient-to-r from-orange-900 to-amber-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-xs font-semibold text-orange-200 px-3 py-1 rounded-full">
              🏸 Badminton · Semifinals Today
            </span>
            <Link
              href="/scores/badminton-2026"
              className="text-xs text-orange-300 hover:text-white font-medium transition-colors shrink-0"
            >
              View draw →
            </Link>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-orange-300/70 uppercase tracking-wide font-semibold mb-2">Women's Singles · Men's Doubles · Mixed Doubles</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Priyansha Verma vs Aakansha Baluni</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Ankita Pattnaik vs Sanghamitra Barman</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Peeyush+Shobhit vs Biswajeet+Manoj</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Nishant+Rajeev vs Vijay+Abhishek</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Ketan+Komal vs Biswajeet+Ankita</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Shobhit+Shruti vs Priyansha+Prashant</div>
              </div>
            </div>
            <div>
              <p className="text-xs text-orange-300/70 uppercase tracking-wide font-semibold mb-2">Boys · Girls · Kids Boys · Kids Girls Singles</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Ishan Deb vs Arshit</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Ridhaan vs Tabish Ansari</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Saanvi Agrawal vs Shreya Shaanvi</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Ashwika Gopu vs Yuvika Gupta</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Sahil vs Vivaan Mishra</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Atharv Singhal vs Aryan Agarwal</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Pratyusha vs Miraya</div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white/90 font-medium">Maedhini S vs Ishita Deb</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Card */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-6 sm:p-8">
          <RegistrationForm events={events} site={site} culturalStatus={culturalStatus} competitiveStatus={competitiveStatus} registrationCounts={registrationCounts} culturalPasswordRequired={culturalPasswordRequired} />
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">{site.form_footer_note}</p>
      </main>
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
