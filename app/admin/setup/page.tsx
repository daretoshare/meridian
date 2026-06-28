import { createAdminSupabaseClient } from '@/lib/supabaseServer'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import SetupClient from './SetupClient'

export const dynamic = 'force-dynamic'

interface Check {
  label: string
  ok: boolean
  detail: string
}

export default async function SetupPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const admin = await createAdminSupabaseClient()

  const checks: Check[] = []

  // ── Check: events table readable by service_role
  {
    const { data, error } = await (admin as any).from('events').select('id').limit(1)
    checks.push({
      label: 'events table — service role read',
      ok: !error,
      detail: error ? `${error.code}: ${error.message}` : `✓ ${data?.length ?? 0} row(s) visible`,
    })
  }

  // ── Check: profiles table insertable by anon
  {
    const anonClient = await createServerSupabaseClient()
    const { error } = await (anonClient as any)
      .from('profiles')
      .insert({ full_name: '__probe__', block: 'Tower 1', apartment_number: '501001', phone_number: '9876543210', email: `probe_${Date.now()}@meridianpark.test` })
      .select('id')
      .single()

    const blocked = error?.code === '42501' || error?.message?.includes('permission denied') || error?.message?.includes('row-level security')
    checks.push({
      label: 'profiles table — anon insert (RLS)',
      ok: !error || error.code === '23505', // 23505 = duplicate email (means it worked before)
      detail: error
        ? (blocked ? `❌ Blocked — ${error.code}: ${error.message}` : `${error.code}: ${error.message}`)
        : '✓ Insert succeeded',
    })
  }

  // ── Check: registrations table insertable
  {
    const { error } = await (admin as any)
      .from('registrations')
      .select('id')
      .limit(1)
    checks.push({
      label: 'registrations table — service role read',
      ok: !error,
      detail: error ? `${error.code}: ${error.message}` : '✓ Accessible',
    })
  }

  // ── Check: events with stable IDs present
  {
    const { data, error } = await (admin as any)
      .from('events')
      .select('id')
      .eq('id', 'e1000001-0000-0000-0000-000000000001')
      .single()
    checks.push({
      label: 'Stable event IDs present (from content/events.md)',
      ok: !error && !!data,
      detail: error
        ? '❌ Not found — run the migration SQL or npm run sync-events'
        : '✓ Markdown event IDs are in the database',
    })
  }

  const allOk = checks.every((c) => c.ok)

  // Read migration SQL for display
  const migrationSql = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/002_fix_grants_and_seed.sql'),
    'utf-8'
  )

  return <SetupClient checks={checks} allOk={allOk} migrationSql={migrationSql} />
}
