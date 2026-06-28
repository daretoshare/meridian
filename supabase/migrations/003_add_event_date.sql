-- Add event_date column to events table
alter table public.events
  add column if not exists event_date date;

-- Default existing events to Independence Day (15 Aug 2025)
update public.events set event_date = '2025-08-15' where event_date is null;
