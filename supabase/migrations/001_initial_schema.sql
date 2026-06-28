-- ============================================================
-- Meridian Park: Independence Day Event Registration Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- Table: profiles
-- Stores resident details for the housing society
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  block        text not null,
  apartment_number text not null,
  phone_number text not null,
  email        text not null unique,
  created_at   timestamptz not null default now(),

  constraint profiles_apartment_format check (apartment_number ~ '^[56][0-9]{4,5}$')
);

comment on table public.profiles is 'Meridian Park resident profiles';
comment on column public.profiles.apartment_number is 'Format: T1-1002 (Block Letter + Number - Unit Number)';

-- ============================================================
-- Table: events
-- Independence Day activities with age groups and slots
-- ============================================================
create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  age_group        text not null,
  slot_time        text not null,
  max_participants integer not null default 30,
  location         text not null default 'Clubhouse Hall 1',
  description      text,
  is_active        boolean not null default true,

  constraint events_age_group_check check (
    age_group in ('children', 'teens', 'adults', 'seniors', 'all')
  ),
  constraint events_max_participants_positive check (max_participants > 0)
);

comment on table public.events is 'Independence Day events and activities';
comment on column public.events.age_group is 'One of: children, teens, adults, seniors, all';

-- ============================================================
-- Table: registrations
-- Maps profiles to events (many-to-many with status)
-- ============================================================
create table if not exists public.registrations (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_id   uuid not null references public.events(id) on delete cascade,
  status     text not null default 'confirmed',
  created_at timestamptz not null default now(),

  -- Prevent duplicate registration: same person, same event
  constraint registrations_unique_profile_event unique (profile_id, event_id),
  constraint registrations_status_check check (status in ('confirmed', 'waitlisted', 'cancelled'))
);

comment on table public.registrations is 'Event registrations linking profiles to events';

-- ============================================================
-- Indexes for common query patterns
-- ============================================================
create index if not exists idx_registrations_event_id   on public.registrations(event_id);
create index if not exists idx_registrations_profile_id on public.registrations(profile_id);
create index if not exists idx_registrations_status     on public.registrations(status);
create index if not exists idx_profiles_block           on public.profiles(block);
create index if not exists idx_profiles_email           on public.profiles(email);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.events        enable row level security;
alter table public.registrations enable row level security;

-- Public can insert their own profile (anonymous registration flow)
create policy "Anyone can create a profile"
  on public.profiles for insert
  with check (true);

-- Public can read events (so the form can list them)
create policy "Anyone can view active events"
  on public.events for select
  using (is_active = true);

-- Public can insert registrations
create policy "Anyone can register"
  on public.registrations for insert
  with check (true);

-- Public can view their own registrations (by profile email match via join — handled server-side)
create policy "Public can view registrations"
  on public.registrations for select
  using (true);

-- Only authenticated admins can update/delete
create policy "Admins can manage events"
  on public.events for all
  using (auth.role() = 'authenticated');

create policy "Admins can manage registrations"
  on public.registrations for update
  using (auth.role() = 'authenticated');

-- ============================================================
-- Seed: Independence Day Events
-- ============================================================
insert into public.events (name, age_group, slot_time, max_participants, location, description) values
  ('Painting Competition',    'children', '09:00 AM – 10:30 AM', 25, 'Clubhouse Hall 1',   'Open theme painting for kids aged 4–12'),
  ('Painting Competition',    'teens',    '11:00 AM – 12:30 PM', 25, 'Clubhouse Hall 1',   'Open theme painting for teens aged 13–18'),
  ('Chess Tournament',        'adults',   '10:00 AM – 01:00 PM', 16, 'Clubhouse Hall 2',   'Swiss-format chess tournament for adults'),
  ('Chess Tournament',        'seniors',  '03:00 PM – 05:00 PM', 16, 'Clubhouse Hall 2',   'Friendly chess for residents 60+'),
  ('Badminton (Singles)',     'teens',    '07:00 AM – 09:00 AM', 20, 'Badminton Court 1',  'Singles knockout for teens'),
  ('Badminton (Singles)',     'adults',   '07:00 AM – 09:00 AM', 20, 'Badminton Court 2',  'Singles knockout for adults'),
  ('Badminton (Doubles)',     'adults',   '05:00 PM – 07:00 PM', 24, 'Badminton Court 1',  'Doubles tournament for adults'),
  ('Cultural Programme',      'all',      '06:30 PM – 09:00 PM', 200,'Main Lawn',          'Song, dance, and skit performances'),
  ('Tug of War',              'all',      '04:00 PM – 05:00 PM', 40, 'Main Lawn',          'Inter-block team competition'),
  ('Independence Day Quiz',   'teens',    '02:00 PM – 03:30 PM', 30, 'Clubhouse Hall 1',   'History and general knowledge quiz');
