-- Fix data_sources table security by ensuring only service roles can access it
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage data sources" ON public.data_sources;

-- Create strict service role only policy for data_sources
CREATE POLICY "Service role only access to data sources"
ON public.data_sources
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure no public access to data_sources table
-- RLS is already enabled, so this will block all non-service-role access