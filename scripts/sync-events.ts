/**
 * Syncs events from content/events.md → Supabase.
 * Run with:  npm run sync-events
 *
 * Safe to run multiple times — uses upsert by stable event ID.
 * Sets is_active=false for any event in Supabase whose id is NOT in the file.
 */

import * as fs from 'fs'
import * as path from 'path'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function main() {
  const raw = fs.readFileSync(path.join(process.cwd(), 'content', 'events.md'), 'utf-8')
  const { data } = matter(raw)
  const allEvents: any[] = data.events ?? []

  if (allEvents.length === 0) {
    console.log('⚠️  No events found in content/events.md')
    return
  }

  console.log(`📋  Found ${allEvents.length} events in content/events.md`)

  // Only pass known DB columns — strip YAML-only fields (e.g. category)
  const dbRows = allEvents.map((e: any) => ({
    id:                e.id,
    name:              e.name,
    age_group:         e.age_group,
    event_date:        e.event_date ?? null,
    slot_time:         e.slot_time,
    max_participants:  e.max_participants,
    location:          e.location,
    description:       e.description ?? '',
    is_active:         e.is_active ?? true,
    registration_type: e.registration_type ?? 'competitive',
    is_team:           e.is_team ?? false,
  }))

  console.log(`⬆️   Upserting ${dbRows.length} events …`)

  const { error: upsertError } = await supabase
    .from('events')
    .upsert(dbRows, { onConflict: 'id', ignoreDuplicates: false })

  if (upsertError) {
    console.error('❌  Upsert failed:', upsertError.message)
    process.exit(1)
  }

  console.log(`✅  Upserted ${dbRows.length} events`)

  // Deactivate any DB event whose id is no longer in events.md
  const fileIds = dbRows.map((e) => e.id)
  const { data: dbEvents } = await supabase.from('events').select('id')
  const staleIds = (dbEvents ?? [])
    .map((e: { id: string }) => e.id)
    .filter((id: string) => !fileIds.includes(id))

  if (staleIds.length > 0) {
    const { error: deactivateError } = await supabase
      .from('events')
      .update({ is_active: false })
      .in('id', staleIds)

    if (deactivateError) {
      console.warn('⚠️  Could not deactivate stale events:', deactivateError.message)
    } else {
      console.log(`🔕  Deactivated ${staleIds.length} stale event(s) not in events.md`)
    }
  }

  console.log('🎉  Sync complete!')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
