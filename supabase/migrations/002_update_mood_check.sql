-- Migration: Update mood check constraint to include all app moods
-- Description: Adds 'calm' and 'angry' to the allowed mood values in the entries table.

-- 1. Drop the existing constraint
ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_mood_check;

-- 2. Add the new constraint with the complete list of moods
-- Previous values: 'happy', 'love', 'grateful', 'peaceful', 'excited', 'sad', 'anxious', 'tired'
-- New values needed: 'calm', 'angry'
-- Combined list: 'happy', 'love', 'grateful', 'peaceful', 'excited', 'sad', 'anxious', 'tired', 'calm', 'angry'

ALTER TABLE entries ADD CONSTRAINT entries_mood_check 
CHECK (mood IN (
  'happy', 
  'love', 
  'grateful', 
  'peaceful', 
  'excited', 
  'sad', 
  'anxious', 
  'tired', 
  'calm', 
  'angry'
));
