-- Enable RLS for the 'places' table if not already enabled
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- Drop the existing policy, if it exists, to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous read access to places" ON public.places;

-- Create a new policy that allows SELECT operations for the 'anon' role
CREATE POLICY "Allow anonymous read access to places"
ON public.places
FOR SELECT
TO anon
USING (true);

-- Grant SELECT permissions on the 'places' table to the 'anon' role
GRANT SELECT ON TABLE public.places TO anon;
