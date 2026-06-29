-- Migration 006: Add registration_type and is_team columns to events
-- Run this in the Supabase SQL Editor

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS registration_type TEXT NOT NULL DEFAULT 'competitive',
  ADD COLUMN IF NOT EXISTS is_team BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_registration_type_check;

ALTER TABLE events
  ADD CONSTRAINT events_registration_type_check
  CHECK (registration_type IN ('competitive', 'cultural', 'open'));

-- Back-fill cultural events that already exist
UPDATE events SET registration_type = 'cultural' WHERE name IN (
  'Kids Solo Singing',
  'Kids Dance (Solo)',
  'Kids Dance (Group)',
  'Fancy Dress',
  'Musical Chair',
  'Adult Solo Singing',
  'Musical Instruments',
  'Group Singing'
);

-- Back-fill team events that already exist
UPDATE events SET is_team = true WHERE name IN (
  'Kids Dance (Group)',
  'Group Singing',
  'Lemon & Spoon Race',
  'Volleyball',
  'Tug of War',
  'Carroms',
  'Treasure Hunt'
);
