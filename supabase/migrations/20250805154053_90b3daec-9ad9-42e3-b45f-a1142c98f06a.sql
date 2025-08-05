-- Create team_members table for invitation system
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Reviewer', 'Analyst')),
  invite_token TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members
CREATE POLICY "Users can view team members they invited" 
ON public.team_members 
FOR SELECT 
USING (auth.uid() = inviter_id);

CREATE POLICY "Users can insert team member invitations" 
ON public.team_members 
FOR INSERT 
WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their team member invitations" 
ON public.team_members 
FOR UPDATE 
USING (auth.uid() = inviter_id);

-- Add funding_amount column to applications table for live metrics
ALTER TABLE public.applications 
ADD COLUMN funding_amount DECIMAL(15,2) DEFAULT 0;

-- Create function to calculate live dashboard metrics
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_applications INTEGER;
  approved_applications INTEGER;
  success_rate DECIMAL(5,2);
  total_funding DECIMAL(15,2);
  avg_processing_days DECIMAL(10,2);
  active_applications INTEGER;
  result JSON;
BEGIN
  -- Get total applications count
  SELECT COUNT(*) INTO total_applications
  FROM public.applications 
  WHERE user_id = get_dashboard_metrics.user_id;
  
  -- Get approved applications count
  SELECT COUNT(*) INTO approved_applications
  FROM public.applications 
  WHERE user_id = get_dashboard_metrics.user_id AND status = 'approved';
  
  -- Get active applications count
  SELECT COUNT(*) INTO active_applications
  FROM public.applications 
  WHERE user_id = get_dashboard_metrics.user_id AND status IN ('draft', 'submitted', 'in_review');
  
  -- Calculate success rate
  IF total_applications > 0 THEN
    success_rate := (approved_applications::DECIMAL / total_applications::DECIMAL) * 100;
  ELSE
    success_rate := 0;
  END IF;
  
  -- Get total funding secured
  SELECT COALESCE(SUM(funding_amount), 0) INTO total_funding
  FROM public.applications 
  WHERE user_id = get_dashboard_metrics.user_id AND status = 'approved';
  
  -- Calculate average processing time
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400), 0) INTO avg_processing_days
  FROM public.applications 
  WHERE user_id = get_dashboard_metrics.user_id 
    AND status IN ('approved', 'rejected') 
    AND updated_at IS NOT NULL;
  
  -- Build result JSON
  result := json_build_object(
    'activeApplications', json_build_object('count', active_applications, 'change', '+0%'),
    'newMatches', json_build_object('count', 0, 'change', '+0%'),
    'successRate', json_build_object('percentage', success_rate, 'change', '+0%'),
    'totalApplied', json_build_object('count', total_applications, 'change', '+0%'),
    'fundingSecured', total_funding,
    'avgProcessingDays', avg_processing_days
  );
  
  RETURN result;
END;
$$;

-- Add trigger for team_members updated_at
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();