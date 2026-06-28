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

export interface EventEdits {
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
