-- Migration: Add media columns to entries table
-- Created: 2026-01-17
-- Description: Adds photo_url, voice_note_url, and voice_note_duration columns

-- Add photo_url for image attachments
ALTER TABLE entries ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Migration logic for photo_url
ALTER TABLE entries ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_entries_photo ON entries(photo_url) WHERE photo_url IS NOT NULL;
