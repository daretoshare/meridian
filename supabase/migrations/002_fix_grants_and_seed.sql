-- ============================================================
-- Migration 002: Fix grants, RLS policies, and re-seed events
-- Run the ENTIRE file in Supabase SQL Editor → New Query
-- ============================================================

-- 0. Update apartment format constraint (5 or 6 digits starting with 5 or 6)
alter table public.profiles
  drop constraint if exists profiles_apartment_format;
alter table public.profiles
  add constraint profiles_apartment_format
  check (apartment_number ~ '^[56][0-9]{4,5}$');

-- 1. Schema usage
grant usage on schema public to anon, authenticated, service_role;

-- 2. Table-level grants (needed alongside RLS in newer Supabase projects)
grant select, insert, update, delete on public.profiles      to service_role;
grant select, insert, update, delete on public.events        to service_role;
grant select, insert, update, delete on public.registrations to service_role;

grant select         on public.events        to anon, authenticated;
grant select, insert on public.profiles      to anon, authenticated;
grant select, insert on public.registrations to anon, authenticated;
grant update         on public.registrations to authenticated;

-- 3. Drop and recreate all RLS policies cleanly
drop policy if exists "Anyone can create a profile"   on public.profiles;
drop policy if exists "Anyone can view active events" on public.events;
drop policy if exists "Anyone can register"           on public.registrations;
drop policy if exists "Public can view registrations" on public.registrations;
drop policy if exists "Admins can manage events"      on public.events;
drop policy if exists "Admins can manage registrations" on public.registrations;

-- profiles: anyone can insert their own row; no select for anon (privacy)
create policy "profiles_insert_anon"
  on public.profiles for insert to anon, authenticated
  with check (true);

create policy "profiles_select_service"
  on public.profiles for select to service_role
  using (true);

create policy "profiles_all_authenticated"
  on public.profiles for all to authenticated
  using (true) with check (true);

-- events: public can read active events
create policy "events_select_public"
  on public.events for select to anon, authenticated
  using (is_active = true);

create policy "events_all_service"
  on public.events for all to service_role
  using (true) with check (true);

create policy "events_all_authenticated"
  on public.events for all to authenticated
  using (true) with check (true);

-- registrations: anyone can insert; service_role/authenticated can manage
create policy "registrations_insert_anon"
  on public.registrations for insert to anon, authenticated
  with check (true);

create policy "registrations_select_anon"
  on public.registrations for select to anon, authenticated
  using (true);

create policy "registrations_all_service"
  on public.registrations for all to service_role
  using (true) with check (true);

create policy "registrations_update_authenticated"
  on public.registrations for update to authenticated
  using (true) with check (true);

-- 4. Re-seed events with stable IDs (matches content/events.md)
--    Uses ON CONFLICT DO UPDATE so it's safe to re-run.
insert into public.events (id, name, age_group, slot_time, max_participants, location, description, is_active)
values
  ('e1000001-0000-0000-0000-000000000001', 'Painting Competition',  'children', '09:00 AM – 10:30 AM', 25,  'Clubhouse Hall 1',  'Open theme painting for kids aged 4–12',           true),
  ('e1000001-0000-0000-0000-000000000002', 'Painting Competition',  'teens',    '11:00 AM – 12:30 PM', 25,  'Clubhouse Hall 1',  'Open theme painting for teens aged 13–18',         true),
  ('e1000001-0000-0000-0000-000000000003', 'Chess Tournament',      'adults',   '10:00 AM – 01:00 PM', 16,  'Clubhouse Hall 2',  'Swiss-format chess tournament for adults',          true),
  ('e1000001-0000-0000-0000-000000000004', 'Chess Tournament',      'seniors',  '03:00 PM – 05:00 PM', 16,  'Clubhouse Hall 2',  'Friendly chess for residents 60+',                 true),
  ('e1000001-0000-0000-0000-000000000005', 'Badminton (Singles)',   'teens',    '07:00 AM – 09:00 AM', 20,  'Badminton Court 1', 'Singles knockout for teens',                       true),
  ('e1000001-0000-0000-0000-000000000006', 'Badminton (Singles)',   'adults',   '07:00 AM – 09:00 AM', 20,  'Badminton Court 2', 'Singles knockout for adults',                      true),
  ('e1000001-0000-0000-0000-000000000007', 'Badminton (Doubles)',   'adults',   '05:00 PM – 07:00 PM', 24,  'Badminton Court 1', 'Doubles tournament for adults',                    true),
  ('e1000001-0000-0000-0000-000000000008', 'Cultural Programme',    'all',      '06:30 PM – 09:00 PM', 200, 'Main Lawn',         'Song, dance, and skit performances',               true),
  ('e1000001-0000-0000-0000-000000000009', 'Tug of War',            'all',      '04:00 PM – 05:00 PM', 40,  'Main Lawn',         'Inter-tower team competition',                     true),
  ('e1000001-0000-0000-0000-000000000010', 'Independence Day Quiz', 'teens',    '02:00 PM – 03:30 PM', 30,  'Clubhouse Hall 1',  'History and general knowledge quiz',               true)
on conflict (id) do update set
  name             = excluded.name,
  age_group        = excluded.age_group,
  slot_time        = excluded.slot_time,
  max_participants = excluded.max_participants,
  location         = excluded.location,
  description      = excluded.description,
  is_active        = excluded.is_active;

-- 5. Deactivate old auto-generated events (keep rows so no FK breakage)
update public.events
set is_active = false
where id not in (
  'e1000001-0000-0000-0000-000000000001',
  'e1000001-0000-0000-0000-000000000002',
  'e1000001-0000-0000-0000-000000000003',
  'e1000001-0000-0000-0000-000000000004',
  'e1000001-0000-0000-0000-000000000005',
  'e1000001-0000-0000-0000-000000000006',
  'e1000001-0000-0000-0000-000000000007',
  'e1000001-0000-0000-0000-000000000008',
  'e1000001-0000-0000-0000-000000000009',
  'e1000001-0000-0000-0000-000000000010'
);
