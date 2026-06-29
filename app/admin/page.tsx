import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabaseServer'
import { getSiteContent, getLocations } from '@/lib/content'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import type { RegistrationWithDetails, EventWithCount } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const adminClient = await createAdminSupabaseClient()
  const site      = getSiteContent()
  const locations = getLocations()

  const { data: registrations } = await adminClient
    .from('registrations')
    .select(`
      id, profile_id, event_id, status, reason, team_name, created_at,
      profiles ( full_name, block, apartment_number, phone_number, email ),
      events ( name, age_group, slot_time, location, event_date, is_team )
    `)
    .order('created_at', { ascending: false })

  const { data: events } = await adminClient
    .from('events')
    .select('*, registrations ( count )')
    .order('slot_time')

  return (
    <AdminDashboard
      user={user}
      site={site}
      locations={locations}
      registrations={(registrations ?? []) as unknown as RegistrationWithDetails[]}
      events={(events ?? []) as unknown as EventWithCount[]}
    />
  )
}
