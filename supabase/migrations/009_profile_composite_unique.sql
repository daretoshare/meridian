-- Migration 009: Allow multiple profiles per email (different household members)
--
-- Previously, email alone was the unique key on profiles, so two people from
-- the same household sharing an email would overwrite each other's name on
-- every registration. The fix: make (email, full_name) the composite unique
-- key, so each distinct name at the same email gets its own profile row.
--
-- Existing rows are NOT modified — this only changes what future upserts
-- conflict on. The old unique constraint on email is dropped so it no longer
-- prevents two people at the same email from coexisting.

-- 1. Drop the old single-column unique constraint on email
alter table public.profiles
  drop constraint if exists profiles_email_key;

-- 2. Add composite unique constraint on (email, full_name)
alter table public.profiles
  add constraint profiles_email_name_unique unique (email, full_name);

-- 3. Update the index used for lookups
create index if not exists idx_profiles_email_name on public.profiles(email, full_name);
