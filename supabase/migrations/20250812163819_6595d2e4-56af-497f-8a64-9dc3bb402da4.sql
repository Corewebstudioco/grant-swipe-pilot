
-- Grant training corpus for AI fine-tuning
CREATE TABLE public.grant_training_corpus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES public.grant_opportunities(id),
  text_content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('description', 'requirements', 'eligibility', 'guidelines')),
  annotations JSONB,
  quality_score DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical success data for training predictive models
CREATE TABLE public.grant_application_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  grant_id UUID REFERENCES public.grant_opportunities(id),
  application_status TEXT NOT NULL CHECK (application_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
  funding_amount BIGINT,
  application_score DECIMAL(3,2),
  actual_outcome BOOLEAN,
  success_factors JSONB,
  failure_reasons JSONB,
  feedback_notes TEXT,
  submitted_date TIMESTAMP WITH TIME ZONE,
  decision_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interaction data for recommendation improvement
CREATE TABLE public.user_grant_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  grant_id UUID REFERENCES public.grant_opportunities(id),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('viewed', 'saved', 'applied', 'dismissed', 'shared', 'clicked')),
  ai_recommendation_score DECIMAL(3,2),
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  interaction_context JSONB,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI recommendation feedback collection
CREATE TABLE public.ai_recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  grant_id UUID REFERENCES public.grant_opportunities(id),
  recommendation_id UUID,
  ai_score DECIMAL(3,2) NOT NULL,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('relevance', 'accuracy', 'completeness', 'usefulness')),
  feedback_text TEXT,
  outcome_data JSONB,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model performance metrics tracking
CREATE TABLE public.model_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,6) NOT NULL,
  evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dataset_size INTEGER,
  evaluation_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance requirements extracted from grants
CREATE TABLE public.compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES public.grant_opportunities(id),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('eligibility', 'documentation', 'certification', 'financial', 'technical')),
  description TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT TRUE,
  validation_criteria JSONB,
  documentation_needed TEXT[],
  extracted_by_ai BOOLEAN DEFAULT TRUE,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business profile enhancements for AI matching
CREATE TABLE public.business_profiles_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  naics_codes TEXT[],
  employee_count INTEGER,
  annual_revenue BIGINT,
  business_stage TEXT CHECK (business_stage IN ('idea', 'prototype', 'early_revenue', 'growth', 'mature')),
  focus_areas TEXT[],
  certifications TEXT[],
  technology_stack TEXT[],
  target_markets TEXT[],
  competitive_advantages TEXT[],
  past_funding_history JSONB,
  ai_profile_score DECIMAL(3,2),
  last_ai_analysis TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI model experiments and A/B testing
CREATE TABLE public.ai_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT NOT NULL,
  model_a_version TEXT NOT NULL,
  model_b_version TEXT NOT NULL,
  traffic_split DECIMAL(3,2) DEFAULT 0.5,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  hypothesis TEXT,
  success_metrics JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User assignments for A/B testing
CREATE TABLE public.experiment_user_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.ai_experiments(id),
  user_id UUID NOT NULL,
  assigned_variant TEXT NOT NULL CHECK (assigned_variant IN ('A', 'B')),
  assignment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_grant_training_corpus_grant_id ON public.grant_training_corpus(grant_id);
CREATE INDEX idx_grant_training_corpus_content_type ON public.grant_training_corpus(content_type);
CREATE INDEX idx_grant_application_outcomes_user_id ON public.grant_application_outcomes(user_id);
CREATE INDEX idx_grant_application_outcomes_grant_id ON public.grant_application_outcomes(grant_id);
CREATE INDEX idx_grant_application_outcomes_status ON public.grant_application_outcomes(application_status);
CREATE INDEX idx_user_grant_interactions_user_id ON public.user_grant_interactions(user_id);
CREATE INDEX idx_user_grant_interactions_grant_id ON public.user_grant_interactions(grant_id);
CREATE INDEX idx_user_grant_interactions_type ON public.user_grant_interactions(interaction_type);
CREATE INDEX idx_ai_recommendation_feedback_user_id ON public.ai_recommendation_feedback(user_id);
CREATE INDEX idx_ai_recommendation_feedback_grant_id ON public.ai_recommendation_feedback(grant_id);
CREATE INDEX idx_compliance_requirements_grant_id ON public.compliance_requirements(grant_id);
CREATE INDEX idx_business_profiles_enhanced_user_id ON public.business_profiles_enhanced(user_id);
CREATE INDEX idx_model_performance_metrics_model ON public.model_performance_metrics(model_name, model_version);

-- Enable Row Level Security
ALTER TABLE public.grant_training_corpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_application_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_grant_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_user_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for grant_training_corpus (admin only)
CREATE POLICY "Service role can manage training corpus" 
  ON public.grant_training_corpus 
  FOR ALL 
  USING (true);

-- RLS policies for grant_application_outcomes (users can see own data)
CREATE POLICY "Users can view own application outcomes" 
  ON public.grant_application_outcomes 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own application outcomes" 
  ON public.grant_application_outcomes 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own application outcomes" 
  ON public.grant_application_outcomes 
  FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

-- RLS policies for user_grant_interactions (users can see own data)
CREATE POLICY "Users can view own interactions" 
  ON public.user_grant_interactions 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own interactions" 
  ON public.user_grant_interactions 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

-- RLS policies for ai_recommendation_feedback (users can see own data)
CREATE POLICY "Users can view own feedback" 
  ON public.ai_recommendation_feedback 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own feedback" 
  ON public.ai_recommendation_feedback 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

-- RLS policies for model_performance_metrics (admin only)
CREATE POLICY "Service role can manage model metrics" 
  ON public.model_performance_metrics 
  FOR ALL 
  USING (true);

-- RLS policies for compliance_requirements (public read)
CREATE POLICY "Anyone can view compliance requirements" 
  ON public.compliance_requirements 
  FOR SELECT 
  USING (true);

-- RLS policies for business_profiles_enhanced (users can see own data)
CREATE POLICY "Users can view own enhanced profile" 
  ON public.business_profiles_enhanced 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own enhanced profile" 
  ON public.business_profiles_enhanced 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own enhanced profile" 
  ON public.business_profiles_enhanced 
  FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

-- RLS policies for ai_experiments (admin only)
CREATE POLICY "Service role can manage experiments" 
  ON public.ai_experiments 
  FOR ALL 
  USING (true);

-- RLS policies for experiment_user_assignments (users can see own assignments)
CREATE POLICY "Users can view own experiment assignments" 
  ON public.experiment_user_assignments 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage experiment assignments" 
  ON public.experiment_user_assignments 
  FOR ALL 
  USING (true);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_grant_training_corpus_updated_at
    BEFORE UPDATE ON public.grant_training_corpus
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_grant_application_outcomes_updated_at
    BEFORE UPDATE ON public.grant_application_outcomes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_business_profiles_enhanced_updated_at
    BEFORE UPDATE ON public.business_profiles_enhanced
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
