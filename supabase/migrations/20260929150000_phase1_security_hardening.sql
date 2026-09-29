-- Phase 1 production hardening.
-- Authorization is derived only from auth.jwt()->app_metadata->role.
-- Do not use user_metadata for authorization because users can edit it.

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Remove legacy/permissive policies documented by older setup files.
DROP POLICY IF EXISTS "Allow anonymous read access to places" ON public.places;
DROP POLICY IF EXISTS "Public read access to places" ON public.places;
DROP POLICY IF EXISTS "Authenticated users can insert places" ON public.places;
DROP POLICY IF EXISTS "Authenticated users can update places" ON public.places;
DROP POLICY IF EXISTS "Authenticated users can delete places" ON public.places;
DROP POLICY IF EXISTS "Allow service_role all access to places" ON public.places;

DROP POLICY IF EXISTS "Public read access to media" ON public.media;
DROP POLICY IF EXISTS "Authenticated users can insert media" ON public.media;
DROP POLICY IF EXISTS "Authenticated users can update media" ON public.media;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON public.media;

-- Idempotent policy names for the hardened model.
DROP POLICY IF EXISTS "places_public_read" ON public.places;
DROP POLICY IF EXISTS "places_content_manager_insert" ON public.places;
DROP POLICY IF EXISTS "places_content_manager_update" ON public.places;
DROP POLICY IF EXISTS "places_admin_delete" ON public.places;

DROP POLICY IF EXISTS "media_public_read" ON public.media;
DROP POLICY IF EXISTS "media_content_manager_insert" ON public.media;
DROP POLICY IF EXISTS "media_content_manager_update" ON public.media;
DROP POLICY IF EXISTS "media_admin_delete" ON public.media;

CREATE POLICY "places_public_read"
ON public.places
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "places_content_manager_insert"
ON public.places
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'editor')
);

CREATE POLICY "places_content_manager_update"
ON public.places
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'editor')
)
WITH CHECK (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'editor')
);

CREATE POLICY "places_admin_delete"
ON public.places
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "media_public_read"
ON public.media
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "media_content_manager_insert"
ON public.media
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'editor')
);

CREATE POLICY "media_content_manager_update"
ON public.media
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'editor')
)
WITH CHECK (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'editor')
);

CREATE POLICY "media_admin_delete"
ON public.media
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Table grants determine which operations are visible to the Data API.
REVOKE INSERT, UPDATE, DELETE ON public.places FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.media FROM anon;

GRANT SELECT ON public.places TO anon, authenticated;
GRANT SELECT ON public.media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.places TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media TO authenticated;

-- Storage bucket used by both the frontend and API: place-media.
-- The bucket itself must already exist. Policies below control Data API access.
DROP POLICY IF EXISTS "Public read access to place-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to place-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update place-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from place-media" ON storage.objects;

DROP POLICY IF EXISTS "place_media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "place_media_content_manager_insert" ON storage.objects;
DROP POLICY IF EXISTS "place_media_content_manager_update" ON storage.objects;
DROP POLICY IF EXISTS "place_media_admin_delete" ON storage.objects;

CREATE POLICY "place_media_public_read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'place-media');

CREATE POLICY "place_media_content_manager_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'place-media'
  AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'editor')
);

CREATE POLICY "place_media_content_manager_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'place-media'
  AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'editor')
)
WITH CHECK (
  bucket_id = 'place-media'
  AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'editor')
);

CREATE POLICY "place_media_admin_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'place-media'
  AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
