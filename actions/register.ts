'use server'

import { createAdminSupabaseClient } from '@/lib/supabaseServer'
import { registrationSchema } from '@/lib/validations'
import type { RegistrationFormData } from '@/lib/validations'

const isDev = true // always show DB errors until form is confirmed working

export interface RegistrationSummary {
  id: string
  event_id: string
  event_name: string
  age_group: string
  event_date: string | null
  slot_time: string
  location: string
  is_team: boolean
  team_name: string | null
}

export type ActionResult =
  | { success: true; message: string; registeredCount: number; registrations: RegistrationSummary[] }
  | { success: false; errors: Record<string, string[]> | null; message: string; detail?: string }

export async function registerForEvents(formData: RegistrationFormData): Promise<ActionResult> {
  // 1. Validate input
  const parsed = registrationSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please fix the form errors.',
    }
  }

  const { full_name, tower, apartment_number, phone_number, email, event_ids, event_team_details } = parsed.data

  // 2. Server-side: enforce max one event per activity category
  const { getContentEvents } = await import('@/lib/content')
  const allEvents = getContentEvents(false)
  const eventMap = Object.fromEntries(allEvents.map((e) => [e.id, e.name]))

  const seenCategories = new Set<string>()
  for (const id of event_ids) {
    const category = eventMap[id]
    if (!category) continue
    if (seenCategories.has(category)) {
      return {
        success: false,
        errors: null,
        message: `You can only register for one "${category}" slot. Please select one age group per activity.`,
      }
    }
    seenCategories.add(category)
  }

  // Service role key used here — this is server-side code only, never exposed to the client.
  // It bypasses RLS, which is correct: the server action is the trust boundary.
  const supabase = await createAdminSupabaseClient()

  // 3. Upsert profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert(
      { full_name, block: tower, apartment_number, phone_number, email },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  if (profileError || !profile) {
    console.error('[register] profile upsert failed:', profileError)
    return {
      success: false,
      errors: null,
      message: 'Could not save your profile. Please contact the administrator.',
      detail: isDev
        ? `[dev] ${profileError?.code}: ${profileError?.message} — hint: ${profileError?.hint ?? 'none'}`
        : undefined,
    }
  }

  // 4. Register for each selected event
  const teamEventIds = new Set(allEvents.filter((e) => (e as any).is_team).map((e) => e.id))
  const results = await Promise.allSettled(
    event_ids.map((event_id) =>
      (supabase as any)
        .from('registrations')
        .insert({
          profile_id: profile.id,
          event_id,
          status: 'confirmed',
          team_name:    teamEventIds.has(event_id) && event_team_details?.[event_id]?.team_name
            ? event_team_details[event_id].team_name
            : null,
          team_members: teamEventIds.has(event_id) && event_team_details?.[event_id]?.members?.length
            ? event_team_details[event_id].members
            : null,
        })
        .select('id, event_id')
        .single()
    )
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settled = results as PromiseSettledResult<any>[]

  const succeeded  = settled.filter((r) => r.status === 'fulfilled' && !r.value.error)
  const duplicates = settled.filter((r) => r.status === 'fulfilled' && r.value.error?.code === '23505')
  const failures   = settled.filter(
    (r) =>
      r.status === 'rejected' ||
      (r.status === 'fulfilled' && r.value.error && r.value.error.code !== '23505')
  )

  if (failures.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstError = failures.find((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    console.error('[register] registration insert failed:', firstError?.value?.error)
    return {
      success: false,
      errors: null,
      message: 'Could not complete registration. Please contact the administrator.',
      detail: isDev && firstError
        ? `[dev] ${firstError.value.error?.code}: ${firstError.value.error?.message}`
        : undefined,
    }
  }

  const registeredCount = succeeded.length
  const skippedCount    = duplicates.length

  if (registeredCount === 0 && skippedCount > 0) {
    return {
      success: false,
      errors: null,
      message: 'You are already registered for all selected events.',
    }
  }

  const skippedNote = skippedCount > 0 ? ` (${skippedCount} already registered — skipped)` : ''

  // Build summary rows with event details
  const registrationSummaries: RegistrationSummary[] = succeeded
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map((r) => {
      const regId   = r.value.data?.id ?? ''
      const eventId = r.value.data?.event_id ?? ''
      const evt     = allEvents.find((e) => e.id === eventId)
      return {
        id:         regId,
        event_id:   eventId,
        event_name: evt?.name ?? '',
        age_group:  evt?.age_group ?? '',
        event_date: evt?.event_date ?? null,
        slot_time:  evt?.slot_time ?? '',
        location:   evt?.location ?? '',
        is_team:    (evt as any)?.is_team === true,
        team_name:  (evt as any)?.is_team ? (event_team_details?.[eventId]?.team_name ?? null) : null,
      }
    })

  return {
    success: true,
    message: `Successfully registered for ${registeredCount} event${registeredCount !== 1 ? 's' : ''}!${skippedNote}`,
    registeredCount,
    registrations: registrationSummaries,
  }
}

export async function getActiveEvents() {
  const supabase = await createAdminSupabaseClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('events')
    .select('id, name, age_group, event_date, slot_time, max_participants, location, description, is_active, registration_type, is_team')
    .eq('is_active', true)
    .order('event_date', { ascending: true, nullsFirst: false })
    .order('slot_time', { ascending: true })
  return data ?? []
}
