import { getActiveEvents } from '@/actions/register'
import { getSiteContent } from '@/lib/content'
import RegistrationForm from '@/components/RegistrationForm'
import { Flag, Shield, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [events, site] = await Promise.all([
    getActiveEvents(),
    Promise.resolve(getSiteContent()),
  ])

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

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Flag size={12} />
          {site.event_badge}
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

      {/* Form Card */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-6 sm:p-8">
          <RegistrationForm events={events} site={site} />
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
