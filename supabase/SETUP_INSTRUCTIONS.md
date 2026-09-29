# Database Setup Instructions

## Run these SQL commands in your Supabase SQL Editor

```sql
-- Create places table if it doesn't exist
CREATE TABLE IF NOT EXISTS places (
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

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_places_province ON places(province);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_media_place_id ON media(place_id);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('place-media', 'place-media', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Security policies are intentionally maintained in:
-- supabase/migrations/20260929150000_phase1_security_hardening.sql
--
-- Do NOT add blanket write policies for the authenticated role here.
-- Apply the migration so write access is restricted by app_metadata.role.
```

## After running the SQL:

1. Go to your admin panel at `/admin`
2. Click on "New Attraction"
3. Fill in the form:
   - Name: Ratchaprapha Dam
   - Local Name: เขื่อนรัชชประภา
   - Province: สุราษฎร์ธานี
   - Category: ธรรมชาติ / เขื่อน / ทะเลสาบ
   - Description: เขื่อนรัชชประภา หรือที่รู้จักกันในชื่อ เขื่อนเชี่ยวหลาน...
   - Coordinates: 8.966, 98.186
4. Upload the two images
5. Click "Create Attraction"
