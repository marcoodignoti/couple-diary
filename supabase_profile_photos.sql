-- Create the storage bucket for profile photos (private - only owner can view)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true);

-- Policy: Allow authenticated users to upload to their own folder (userId/*)
CREATE POLICY "Allow profile photo uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view ONLY their own profile photos (private)
CREATE POLICY "Allow viewing own profile photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update (overwrite) their own photos
CREATE POLICY "Allow profile photo updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own photos
CREATE POLICY "Allow profile photo deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
