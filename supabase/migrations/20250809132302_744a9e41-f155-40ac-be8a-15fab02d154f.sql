
-- Create activities table to track user actions
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own activities
CREATE POLICY "Users can view their own activities" 
  ON public.activities 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own activities
CREATE POLICY "Users can create their own activities" 
  ON public.activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX activities_user_id_created_at_idx ON public.activities(user_id, created_at DESC);
