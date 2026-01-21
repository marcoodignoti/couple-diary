-- Add anniversary_date column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS anniversary_date DATE;

-- Function to sync anniversary to partner when updated
CREATE OR REPLACE FUNCTION sync_anniversary_to_partner()
RETURNS TRIGGER AS $$
BEGIN
    -- If anniversary_date changed and user has a partner
    IF NEW.anniversary_date IS DISTINCT FROM OLD.anniversary_date 
       AND NEW.partner_id IS NOT NULL THEN
        -- Update partner's anniversary to match
        UPDATE profiles 
        SET anniversary_date = NEW.anniversary_date
        WHERE id = NEW.partner_id
          AND (anniversary_date IS DISTINCT FROM NEW.anniversary_date);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync anniversary on update
DROP TRIGGER IF EXISTS sync_anniversary_trigger ON profiles;
CREATE TRIGGER sync_anniversary_trigger
    AFTER UPDATE OF anniversary_date ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_anniversary_to_partner();

-- Add avatar_url column if not exists (for profile image feature)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
