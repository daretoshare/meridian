-- Prevent duplicate slots: same activity + age group + date can only exist once
alter table public.events
  drop constraint if exists events_unique_slot;

alter table public.events
  add constraint events_unique_slot
  unique (name, age_group, event_date);
