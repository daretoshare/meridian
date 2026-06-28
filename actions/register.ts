'use server'

import { createAdminSupabaseClient } from '@/lib/supabaseServer'
import { registrationSchema } from '@/lib/validations'
import type { RegistrationFormData } from '@/lib/validations'

const isDev = true // always show DB errors until form is confirmed working

export type ActionResult =
  | { success: true; message: string; registeredCount: number }
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

  const { full_name, tower, apartment_number, phone_number, email, event_ids } = parsed.data

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
  const results = await Promise.allSettled(
    event_ids.map((event_id) =>
      supabase
        .from('registrations')
        .insert({ profile_id: profile.id, event_id, status: 'confirmed' })
        .select('id')
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

  return {
    success: true,
    message: `Successfully registered for ${registeredCount} event${registeredCount !== 1 ? 's' : ''}!${skippedNote}`,
    registeredCount,
  }
}

export async function getActiveEvents() {
  const { getContentEvents } = await import('@/lib/content')
  return getContentEvents(true)
}
