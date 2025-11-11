-- Create a new policy that allows ALL operations for the 'service_role'
CREATE POLICY "Allow service_role all access to places"
ON public.places
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
