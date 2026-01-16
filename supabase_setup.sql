-- Create the storage bucket for entry photos
insert into storage.buckets (id, name, public)
values ('entry-photos', 'entry-photos', true);

-- Policy: Allow authenticated users to upload files to their own folder (userId/*)
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'entry-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to view all photos in the bucket
-- (Partners need to see each other's photos)
create policy "Allow authenticated viewing"
on storage.objects for select
to authenticated
using ( bucket_id = 'entry-photos' );

-- Policy: Allow users to delete their own photos
create policy "Allow users to delete own photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'entry-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
