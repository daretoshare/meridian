import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabaseServer'
import { getContentEvents } from '@/lib/content'

export async function POST(request: Request) {
  const secret = request.headers.get('x-seed-secret')
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const events = getContentEvents(false)
  const supabase = await createAdminSupabaseClient()
  const db = supabase as any

  const stableIds = events.map((e) => e.id)

  // Remove any rows that share (name, age_group, event_date) with a stable-ID
  // event but carry a different (legacy auto-generated) ID. These would violate
  // the unique constraint when we upsert the canonical rows.
  for (const e of events) {
    await db
      .from('events')
      .delete()
      .eq('name', e.name)
      .eq('age_group', e.age_group)
      .eq('event_date', e.event_date)
      .neq('id', e.id)
  }

  // Strip any YAML-only fields (e.g. category) that have no DB column
  const dbRows = events.map(({ id, name, age_group, event_date, slot_time, max_participants, location, description, is_active }: any) => ({
    id, name, age_group, event_date, slot_time, max_participants, location, description, is_active,
  }))

  // Upsert canonical events by stable ID
  const { error: upsertError } = await db
    .from('events')
    .upsert(dbRows, { onConflict: 'id', ignoreDuplicates: false })

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message, code: upsertError.code }, { status: 500 })
  }

  // Deactivate DB rows whose IDs are no longer in events.md
  const { data: allDbEvents } = await db.from('events').select('id')
  const staleIds = (allDbEvents ?? [])
    .map((e: { id: string }) => e.id)
    .filter((id: string) => !stableIds.includes(id))

  if (staleIds.length > 0) {
    await db.from('events').update({ is_active: false }).in('id', staleIds)
  }

  return NextResponse.json({
    ok: true,
    upserted: events.length,
    deactivated: staleIds.length,
    events: events.map((e) => ({ id: e.id, name: e.name, age_group: e.age_group })),
  })
}
