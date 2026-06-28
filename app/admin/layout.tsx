import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to the login page without auth
  // The redirect is handled per-page for the protected dashboard
  return <>{children}</>
}
