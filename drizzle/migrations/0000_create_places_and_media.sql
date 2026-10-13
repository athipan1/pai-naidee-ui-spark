-- Places (attractions) table
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_local TEXT,
  province TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media (images / videos) attached to a place
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_places_province ON public.places(province);
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places(category);
CREATE INDEX IF NOT EXISTS idx_media_place_id ON public.media(place_id);

-- Data API grants (Supabase does not grant public-schema access by default)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.places TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.places TO authenticated;
GRANT ALL ON public.places TO service_role;
GRANT SELECT ON public.media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;

-- Row Level Security
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- places policies
DROP POLICY IF EXISTS "Public read access to places" ON public.places;
CREATE POLICY "Public read access to places"
  ON public.places FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert places" ON public.places;
CREATE POLICY "Authenticated users can insert places"
  ON public.places FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update places" ON public.places;
CREATE POLICY "Authenticated users can update places"
  ON public.places FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete places" ON public.places;
CREATE POLICY "Authenticated users can delete places"
  ON public.places FOR DELETE TO authenticated USING (true);

-- media policies
DROP POLICY IF EXISTS "Public read access to media" ON public.media;
CREATE POLICY "Public read access to media"
  ON public.media FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert media" ON public.media;
CREATE POLICY "Authenticated users can insert media"
  ON public.media FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update media" ON public.media;
CREATE POLICY "Authenticated users can update media"
  ON public.media FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete media" ON public.media;
CREATE POLICY "Authenticated users can delete media"
  ON public.media FOR DELETE TO authenticated USING (true);

-- Storage policies for the place-media bucket
DROP POLICY IF EXISTS "Public read access to place-media" ON storage.objects;
CREATE POLICY "Public read access to place-media"
  ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'place-media');

DROP POLICY IF EXISTS "Authenticated users can upload to place-media" ON storage.objects;
CREATE POLICY "Authenticated users can upload to place-media"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'place-media');

DROP POLICY IF EXISTS "Authenticated users can update place-media" ON storage.objects;
CREATE POLICY "Authenticated users can update place-media"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'place-media') WITH CHECK (bucket_id = 'place-media');

DROP POLICY IF EXISTS "Authenticated users can delete from place-media" ON storage.objects;
CREATE POLICY "Authenticated users can delete from place-media"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'place-media');