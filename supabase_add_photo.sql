-- Add photo_url column to entries table if it doesn't exist
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Verify policies allow updating this new column (standard policies usually cover all columns)
-- But let's ensuring nothing blocks it.
