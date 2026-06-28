'use server'

import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabaseServer'
import { adminLoginSchema } from '@/lib/validations'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function adminLogin(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = adminLoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, message: 'Invalid credentials format.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { success: false, message: 'Invalid email or password.' }
  }

  redirect('/admin')
}

export async function adminLogout() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export interface NewEvent {
  name: string
  age_group: string
  event_date: string
  slot_time: string
  location: string
  max_participants: number
  description: string
}

export async function createEvent(event: NewEvent) {
  const supabase = await createAdminSupabaseClient() as any
  // Generate a sequential-style ID based on timestamp
  const id = `e${Date.now().toString(16).padStart(8, '0')}-0000-0000-0000-${Math.random().toString(16).slice(2).padStart(12, '0')}`
  const { error } = await supabase
    .from('events')
    .insert({ ...event, id, is_active: true })

  if (error) return { success: false, message: error.message }
  revalidatePath('/admin')
  return { success: true, message: 'Event created.', id }
}

export interface EventEdits {
  event_date?: string
  slot_time?: string
  location?: string
  max_participants?: number
  description?: string
  is_active?: boolean
}

export async function updateEvent(eventId: string, updates: EventEdits) {
  const supabase = await createAdminSupabaseClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('events')
    .update(updates)
    .eq('id', eventId)

  if (error) return { success: false, message: error.message }
  revalidatePath('/admin')
  return { success: true, message: 'Event updated.' }
}

export async function deleteEvent(eventId: string) {
  const supabase = await createAdminSupabaseClient() as any

  // Block deletion if registrations exist — suggest hiding instead
  const { count } = await supabase
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)

  if (count && count > 0) {
    return {
      success: false,
      message: `Cannot delete — ${count} registration(s) exist for this event. Use the toggle to hide it instead.`,
    }
  }

  const { error } = await supabase.from('events').delete().eq('id', eventId)
  if (error) return { success: false, message: error.message }
  revalidatePath('/admin')
  return { success: true, message: 'Event deleted.' }
}

export async function updateRegistrationStatus(
  registrationId: string,
  status: 'confirmed' | 'waitlisted' | 'cancelled'
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createAdminSupabaseClient() as any
  const { error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', registrationId)

  if (error) return { success: false, message: error.message }
  revalidatePath('/admin')
  return { success: true, message: 'Status updated.' }
}
