
-- Core grant opportunities table with comprehensive fields
CREATE TABLE public.grant_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  agency TEXT,
  program_name TEXT,
  opportunity_number TEXT,
  cfda_number TEXT,
  
  -- Financial details
  estimated_funding BIGINT,
  award_ceiling BIGINT,
  award_floor BIGINT,
  number_of_awards INTEGER,
  
  -- Dates
  posted_date TIMESTAMP WITH TIME ZONE,
  application_due_date TIMESTAMP WITH TIME ZONE,
  archive_date TIMESTAMP WITH TIME ZONE,
  
  -- Eligibility and requirements
  eligibility_requirements TEXT,
  application_requirements TEXT,
  geographic_scope TEXT[],
  applicant_types TEXT[],
  
  -- Categorization
  categories TEXT[],
  tags TEXT[],
  industries TEXT[],
  keywords TEXT[],
  
  -- URLs and documents
  application_url TEXT,
  full_announcement_url TEXT,
  related_documents JSONB,
  
  -- Pipeline metadata
  data_quality_score DECIMAL(3,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  processing_status TEXT DEFAULT 'pending',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant categories and taxonomy
CREATE TABLE public.grant_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES public.grant_categories(id),
  level INTEGER DEFAULT 0,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Industry classifications
CREATE TABLE public.industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  naics_code TEXT,
  description TEXT,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data source configurations
CREATE TABLE public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  api_url TEXT,
  api_key_required BOOLEAN DEFAULT FALSE,
  update_frequency INTEGER DEFAULT 86400,
  last_sync TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing logs and monitoring
CREATE TABLE public.pipeline_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_grant_opportunities_due_date ON public.grant_opportunities(application_due_date);
CREATE INDEX idx_grant_opportunities_categories ON public.grant_opportunities USING GIN(categories);
CREATE INDEX idx_grant_opportunities_tags ON public.grant_opportunities USING GIN(tags);
CREATE INDEX idx_grant_opportunities_industries ON public.grant_opportunities USING GIN(industries);
CREATE INDEX idx_grant_opportunities_text_search ON public.grant_opportunities USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_grant_opportunities_source ON public.grant_opportunities(source);
CREATE INDEX idx_grant_opportunities_active ON public.grant_opportunities(is_active);

-- Enable Row Level Security
ALTER TABLE public.grant_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for grant_opportunities (public read access)
CREATE POLICY "Anyone can view active grant opportunities" 
  ON public.grant_opportunities 
  FOR SELECT 
  USING (is_active = true);

-- RLS policies for grant_categories (public read access)
CREATE POLICY "Anyone can view grant categories" 
  ON public.grant_categories 
  FOR SELECT 
  USING (true);

-- RLS policies for industries (public read access)
CREATE POLICY "Anyone can view industries" 
  ON public.industries 
  FOR SELECT 
  USING (true);

-- RLS policies for data_sources (admin only for now)
CREATE POLICY "Service role can manage data sources" 
  ON public.data_sources 
  FOR ALL 
  USING (true);

-- RLS policies for pipeline_logs (admin only for now)
CREATE POLICY "Service role can manage pipeline logs" 
  ON public.pipeline_logs 
  FOR ALL 
  USING (true);

-- Insert some initial data sources
INSERT INTO public.data_sources (name, api_url, api_key_required, update_frequency, is_active, rate_limit_per_hour, configuration) VALUES
('Grants.gov', 'https://www.grants.gov/grantsws/rest/opportunities/search/', FALSE, 86400, TRUE, 1000, '{"format": "json", "version": "v1"}'),
('USAspending.gov', 'https://api.usaspending.gov/', FALSE, 86400, TRUE, 1000, '{"format": "json", "version": "v2"}');

-- Insert some initial grant categories
INSERT INTO public.grant_categories (name, description, level, keywords) VALUES
('Research & Development', 'Grants focused on research and development activities', 0, ARRAY['research', 'development', 'innovation', 'R&D']),
('Education', 'Educational grants and scholarships', 0, ARRAY['education', 'school', 'university', 'learning']),
('Healthcare', 'Medical and healthcare related grants', 0, ARRAY['health', 'medical', 'healthcare', 'medicine']),
('Environment', 'Environmental protection and sustainability grants', 0, ARRAY['environment', 'green', 'sustainability', 'climate']),
('Technology', 'Technology development and innovation grants', 0, ARRAY['technology', 'tech', 'digital', 'innovation']),
('Small Business', 'Small business development grants', 0, ARRAY['small business', 'entrepreneur', 'startup', 'SME']);

-- Insert some initial industries
INSERT INTO public.industries (name, naics_code, description, keywords) VALUES
('Manufacturing', '31-33', 'Manufacturing industries', ARRAY['manufacturing', 'production', 'factory']),
('Technology', '54', 'Professional, Scientific, and Technical Services', ARRAY['technology', 'software', 'IT', 'tech']),
('Healthcare', '62', 'Health Care and Social Assistance', ARRAY['healthcare', 'medical', 'health']),
('Education', '61', 'Educational Services', ARRAY['education', 'school', 'university']),
('Agriculture', '11', 'Agriculture, Forestry, Fishing and Hunting', ARRAY['agriculture', 'farming', 'forestry']);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_grant_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_grant_opportunities_updated_at
    BEFORE UPDATE ON public.grant_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_grant_opportunities_updated_at();
