-- Add gamification columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_entry_date DATE,
ADD COLUMN IF NOT EXISTS total_entries INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unlocked_themes TEXT[] DEFAULT ARRAY['default'];

-- Create a function to check and update streaks (optional, but good for robust logic)
-- For MVP we calculated this in the client/Edge Function, but DB columns are enough.
