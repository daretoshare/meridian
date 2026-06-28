'use client'

import { useState } from 'react'
import Link from 'next/link'
import { adminLogout } from '@/actions/admin'
import RegistrationsTable from './RegistrationsTable'
import ScheduleManager from './ScheduleManager'
import EventScheduleView from './EventScheduleView'
import type { RegistrationWithDetails, EventWithCount, Event } from '@/types/database'
import type { SiteContent, ContentLocation } from '@/lib/content'
import {
  LayoutDashboard,
  Calendar,
  BarChart2,
  LogOut,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  site: SiteContent
  locations: ContentLocation[]
  registrations: RegistrationWithDetails[]
  events: EventWithCount[]
}

type Tab = 'registrations' | 'schedule' | 'overview'

export default function AdminDashboard({ user, site, locations, registrations, events }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('registrations')

  const confirmedCount = registrations.filter((r) => r.status === 'confirmed').length
  const totalEvents = events.length
  const totalRegistrations = registrations.length
  const uniqueResidents = new Set(registrations.map((r) => r.profile_id)).size

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-tight">{site.society_name}</p>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-700">{user.email}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <Link
              href="/admin/setup"
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded hover:bg-slate-100"
            >
              DB Setup
            </Link>
            <form action={adminLogout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{site.admin_page_title}</h1>
          <p className="text-slate-500 text-sm mt-1">{site.admin_page_subtitle}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users size={20} className="text-blue-600" />}
            bg="bg-blue-50"
            label={site.admin_stat_total}
            value={totalRegistrations}
          />
          <StatCard
            icon={<CheckCircle size={20} className="text-green-600" />}
            bg="bg-green-50"
            label={site.admin_stat_confirmed}
            value={confirmedCount}
          />
          <StatCard
            icon={<TrendingUp size={20} className="text-orange-600" />}
            bg="bg-orange-50"
            label={site.admin_stat_residents}
            value={uniqueResidents}
          />
          <StatCard
            icon={<Calendar size={20} className="text-purple-600" />}
            bg="bg-purple-50"
            label={site.admin_stat_events}
            value={totalEvents}
          />
        </div>

        {/* Tab Bar */}
        <div className="bg-slate-100 rounded-xl p-1.5 inline-flex gap-1">
          <TabButton
            active={activeTab === 'registrations'}
            onClick={() => setActiveTab('registrations')}
            icon={<LayoutDashboard size={15} />}
            label={site.admin_tab_registrations}
          />
          <TabButton
            active={activeTab === 'schedule'}
            onClick={() => setActiveTab('schedule')}
            icon={<Calendar size={15} />}
            label={site.admin_tab_schedule}
          />
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<BarChart2 size={15} />}
            label="Event Overview"
          />
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {activeTab === 'registrations' ? (
            <RegistrationsTable
              registrations={registrations}
              events={events as unknown as Event[]}
            />
          ) : activeTab === 'schedule' ? (
            <ScheduleManager events={events} locations={locations} />
          ) : (
            <EventScheduleView events={events} registrations={registrations} />
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  bg,
  label,
  value,
}: {
  icon: React.ReactNode
  bg: string
  label: string
  value: number
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className={`inline-flex p-2.5 rounded-lg ${bg} mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
        ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
      `}
    >
      {icon}
      {label}
    </button>
  )
}
