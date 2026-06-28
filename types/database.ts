export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          block: string
          apartment_number: string
          phone_number: string
          email: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      events: {
        Row: {
          id: string
          name: string
          age_group: AgeGroup
          event_date: string | null
          slot_time: string
          max_participants: number
          location: string
          description: string | null
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      registrations: {
        Row: {
          id: string
          profile_id: string
          event_id: string
          status: RegistrationStatus
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['registrations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['registrations']['Insert']>
      }
    }
  }
}

export type AgeGroup = 'children' | 'teens' | 'adults' | 'seniors' | 'all'
export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Registration = Database['public']['Tables']['registrations']['Row']

export interface RegistrationWithDetails extends Registration {
  profiles: Pick<Profile, 'full_name' | 'block' | 'apartment_number' | 'phone_number' | 'email'>
  events: Pick<Event, 'name' | 'age_group' | 'slot_time' | 'location'>
}

export interface EventWithCount extends Event {
  registrations: { count: number }[]
}
