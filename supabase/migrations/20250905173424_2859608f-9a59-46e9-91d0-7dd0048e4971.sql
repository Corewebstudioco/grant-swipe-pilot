-- Fix database functions security by adding SET search_path = public
-- This prevents function hijacking through search path manipulation

-- Update get_dashboard_metrics function
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Update update_grant_opportunities_updated_at function
CREATE OR REPLACE FUNCTION public.update_grant_opportunities_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$function$;