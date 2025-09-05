-- Fix data_sources table security by ensuring only service roles can access it
-- Remove any existing permissive policies and add strict service role only access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage data sources" ON public.data_sources;

-- Create strict service role only policy
CREATE POLICY "Service role only access to data sources"
ON public.data_sources
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a safe view for pipeline monitoring that excludes sensitive data
CREATE OR REPLACE VIEW public.pipeline_status AS
SELECT 
  id,
  name,
  is_active,
  last_sync,
  update_frequency,
  created_at
FROM public.data_sources
WHERE is_active = true;

-- Allow authenticated users to read the safe pipeline status view
GRANT SELECT ON public.pipeline_status TO authenticated;

-- Create an edge function accessible version by adding RLS to the view
ALTER VIEW public.pipeline_status OWNER TO supabase_admin;

-- Create policy for the pipeline_status view
CREATE POLICY "Users can view pipeline status"
ON public.pipeline_status
FOR SELECT
TO authenticated
USING (true);