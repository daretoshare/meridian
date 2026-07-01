import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { AgeGroup } from '@/types/database'

const CONTENT_DIR = path.join(process.cwd(), 'content')

function readMd(filename: string) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8')
  return matter(raw)
}

// ─── Site Copy ────────────────────────────────────────────────────────────────

export interface SiteContent {
  society_name: string
  society_subtitle: string
  admin_label: string
  event_badge: string
  hero_heading: string
  hero_subtext: string
  stat_activities_label: string
  stat_activities_value: string
  stat_age_groups_label: string
  stat_age_groups_value: string
  form_section_personal: string
  form_section_events: string
  form_events_hint: string
  form_events_empty_title: string
  form_events_empty_hint: string
  form_footer_note: string
  admin_page_title: string
  admin_page_subtitle: string
  admin_tab_registrations: string
  admin_tab_schedule: string
  admin_stat_total: string
  admin_stat_confirmed: string
  admin_stat_residents: string
  admin_stat_events: string
}

export function getSiteContent(): SiteContent {
  const { data } = readMd('site.md')
  return data as SiteContent
}

// ─── Events ───────────────────────────────────────────────────────────────────

export interface ContentEvent {
  id: string
  name: string
  age_group: AgeGroup
  event_date: string | null
  slot_time: string
  max_participants: number
  location: string
  description: string
  is_active: boolean
}

export function getContentEvents(activeOnly = true): ContentEvent[] {
  const { data } = readMd('events.md')
  const all: ContentEvent[] = data.events ?? []
  return activeOnly ? all.filter((e) => e.is_active) : all
}

export type RegistrationStatus = 'pending' | 'open' | 'closed'

/** Returns the registration status for cultural events: pending | open | closed */
export function getCulturalRegistrationStatus(): RegistrationStatus {
  const { data } = readMd('events.md')
  const v = data.cultural_registration_status
  if (v === 'open' || v === 'closed') return v
  return 'pending'
}

/** Returns the registration status for competitive events: pending | open | closed */
export function getCompetitiveRegistrationStatus(): RegistrationStatus {
  const { data } = readMd('events.md')
  const v = data.competitive_registration_status
  if (v === 'open' || v === 'closed') return v
  return 'pending'
}

// ─── Locations ────────────────────────────────────────────────────────────────

export interface ContentLocation {
  name: string
  capacity?: string
}

export function getLocations(): ContentLocation[] {
  const { data } = readMd('locations.md')
  return data.locations ?? []
}
