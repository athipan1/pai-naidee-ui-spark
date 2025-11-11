-- Grant usage on the public schema to service_role
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant all privileges on the places table to service_role
GRANT ALL ON TABLE public.places TO service_role;
