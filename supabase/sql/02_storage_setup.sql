--
-- Supabase Storage Setup
--

-- 1. Create a new storage bucket for place images.
--    - `public: true` makes the bucket publicly accessible.
--    - `file_size_limit` is set to 5MB.
--    - `allowed_mime_types` restricts uploads to common image formats.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('place_images', 'place_images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

--
-- RLS Policies for Storage
-- These policies control who can interact with the files in the 'place_images' bucket.
--

-- 2. Allow public, anonymous SELECT (read/download) access to all images.
--    This is necessary for the app to display images to all users.
CREATE POLICY "Allow public read access to place images"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'place_images');

-- 3. Allow authenticated users to UPLOAD images into the 'place_images' bucket.
--    The policy ensures that only logged-in users can add new files.
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place_images' AND auth.role() = 'authenticated');

-- 4. Allow authenticated users to UPDATE their OWN images.
--    This policy is more secure, tying file ownership to the user's UID.
--    The uploader's user ID is automatically stored in the `owner` column of `storage.objects`.
CREATE POLICY "Allow users to update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'place_images' AND auth.uid() = owner);

-- 5. Allow authenticated users to DELETE their OWN images.
--    Similar to the update policy, users can only delete files they own.
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'place_images' AND auth.uid() = owner);