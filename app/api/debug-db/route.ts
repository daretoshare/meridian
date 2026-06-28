import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabaseServer'

// GET /api/debug-db — runs the same operations as the registration form and returns detailed results
// Remove this file once the form is working.
export async function GET() {
  const results: Record<string, unknown> = {}

  // 1. Check env vars
  results.env = {
    url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon_key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    service_role_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    url_value: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40),
  }

  // 2. Try admin client
  let supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>
  try {
    supabase = await createAdminSupabaseClient()
    results.admin_client = 'created ok'
  } catch (e) {
    return NextResponse.json({ ...results, admin_client_error: String(e) }, { status: 500 })
  }

  // 3. Read events
  const { data: events, error: eventsErr } = await (supabase as any)
    .from('events')
    .select('id, name, is_active')
    .limit(20)

  results.events = eventsErr
    ? { error: eventsErr.code, message: eventsErr.message }
    : { count: events?.length, sample: events?.slice(0, 3) }

  // 4. Try inserting a test profile
  const testEmail = `debug_${Date.now()}@meridianpark.test`
  const { data: profile, error: profileErr } = await (supabase as any)
    .from('profiles')
    .upsert(
      {
        full_name: 'Debug Test',
        block: 'Tower 1',
        apartment_number: '501001',
        phone_number: '9876543210',
        email: testEmail,
      },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  results.profile_insert = profileErr
    ? { error: profileErr.code, message: profileErr.message, hint: profileErr.hint, details: profileErr.details }
    : { ok: true, profile_id: profile?.id }

  // 5. If profile inserted and events exist, try inserting a registration
  if (profile?.id && events?.length > 0) {
    const testEventId = events[0].id
    const { data: reg, error: regErr } = await (supabase as any)
      .from('registrations')
      .insert({ profile_id: profile.id, event_id: testEventId, status: 'confirmed' })
      .select('id')
      .single()

    results.registration_insert = regErr
      ? { error: regErr.code, message: regErr.message, hint: regErr.hint, event_id_used: testEventId }
      : { ok: true, registration_id: reg?.id }

    // Clean up test data
    if (reg?.id) {
      await (supabase as any).from('registrations').delete().eq('id', reg.id)
    }
    if (profile?.id) {
      await (supabase as any).from('profiles').delete().eq('id', profile.id)
    }
  }

  return NextResponse.json(results, { status: 200 })
}
