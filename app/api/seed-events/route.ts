import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabaseServer'
import { getContentEvents } from '@/lib/content'

// Protected: only callable when the correct header is present.
// Visit /admin/setup to trigger this safely via the UI.
export async function POST(request: Request) {
  const secret = request.headers.get('x-seed-secret')
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const events = getContentEvents(false) // include inactive
  const supabase = await createAdminSupabaseClient()

  // Upsert all events with stable IDs from content/events.md
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertError } = await (supabase as any)
    .from('events')
    .upsert(events, { onConflict: 'id', ignoreDuplicates: false })

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message, code: upsertError.code }, { status: 500 })
  }

  // Deactivate any event in DB whose ID is no longer in the markdown
  const stableIds = events.map((e) => e.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allDbEvents } = await (supabase as any)
    .from('events')
    .select('id')

  const staleIds = (allDbEvents ?? [])
    .map((e: { id: string }) => e.id)
    .filter((id: string) => !stableIds.includes(id))

  if (staleIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('events')
      .update({ is_active: false })
      .in('id', staleIds)
  }

  return NextResponse.json({
    ok: true,
    upserted: events.length,
    deactivated: staleIds.length,
    events: events.map((e) => ({ id: e.id, name: e.name, age_group: e.age_group })),
  })
}
