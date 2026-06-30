-- Add team_members JSONB column to store individual member details for team events.
-- Each element: { name, tower, apartment_number, phone_number }
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS team_members JSONB;
