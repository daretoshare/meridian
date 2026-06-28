/**
 * Syncs events from content/events.md → Supabase.
 * Run with:  npm run sync-events
 *
 * What it does:
 *   - Upserts every event (matched by id) — safe to run multiple times
 *   - Sets is_active=false for any event in Supabase whose id is NOT in the file
 *     (so old registrations are preserved, the event just disappears from the form)
 */

import * as fs from 'fs'
import * as path from 'path'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function main() {
  const raw = fs.readFileSync(path.join(process.cwd(), 'content', 'events.md'), 'utf-8')
  const { data } = matter(raw)
  const events: Array<{
    id: string
    name: string
    age_group: string
    slot_time: string
    max_participants: number
    location: string
    description: string
    is_active: boolean
  }> = data.events ?? []

  if (events.length === 0) {
    console.log('⚠️  No events found in content/events.md')
    return
  }

  console.log(`📋  Syncing ${events.length} events from content/events.md …`)

  // Upsert all events from the file
  const { error: upsertError } = await supabase.from('events').upsert(events, {
    onConflict: 'id',
    ignoreDuplicates: false,
  })

  if (upsertError) {
    console.error('❌  Upsert failed:', upsertError.message)
    process.exit(1)
  }

  console.log(`✅  Upserted ${events.length} events`)

  // Deactivate any event in Supabase that's no longer in the file
  const fileIds = events.map((e) => e.id)
  const { data: dbEvents } = await supabase.from('events').select('id')
  const staleIds = (dbEvents ?? []).map((e: { id: string }) => e.id).filter((id: string) => !fileIds.includes(id))

  if (staleIds.length > 0) {
    const { error: deactivateError } = await supabase
      .from('events')
      .update({ is_active: false })
      .in('id', staleIds)

    if (deactivateError) {
      console.warn('⚠️  Could not deactivate stale events:', deactivateError.message)
    } else {
      console.log(`🔕  Deactivated ${staleIds.length} event(s) no longer in the file`)
    }
  }

  console.log('🎉  Sync complete!')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
