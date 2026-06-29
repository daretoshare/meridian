-- Migration 007: Add team_name column to registrations
-- Run this in the Supabase SQL Editor

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS team_name TEXT;
