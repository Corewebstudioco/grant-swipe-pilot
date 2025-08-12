
export interface BusinessProfile {
  company_name: string;
  industry: string;
  naics_codes?: string[];
  business_size: 'startup' | 'small' | 'medium' | 'large';
  employee_count?: number;
  annual_revenue?: number;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: [number, number];
  };
  business_stage?: 'idea' | 'prototype' | 'early_revenue' | 'growth' | 'mature';
  focus_areas?: string[];
  past_grant_history?: GrantApplicationHistory[];
  certifications?: string[];
  technology_stack?: string[];
  target_markets?: string[];
  competitive_advantages?: string[];
  funding_needs?: string;
  description?: string;
}

export interface GrantApplicationHistory {
  grant_id: string;
  grant_title: string;
  status: 'approved' | 'rejected' | 'pending';
  funding_amount?: number;
  application_date: string;
  decision_date?: string;
}

export interface ComplianceRequirement {
  id: string;
  type: 'eligibility' | 'documentation' | 'certification' | 'financial' | 'technical';
  description: string;
  mandatory: boolean;
  validation_criteria: string[];
  documentation_needed: string[];
  confidence_score?: number;
}

export interface ComplianceReport {
  overallCompliance: number;
  checks: ComplianceCheck[];
  actionItems: ActionItem[];
  estimatedPreparationTime: number;
}

export interface ComplianceCheck {
  requirement: ComplianceRequirement;
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  confidence: number;
  recommendations: string[];
}

export interface ActionItem {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  type: 'documentation' | 'certification' | 'process' | 'financial';
}

export interface CompatibilityScore {
  overall: number;
  breakdown: {
    industry_match: number;
    size_compatibility: number;
    geographic_fit: number;
    historical_success: number;
    requirements_compliance: number;
    funding_alignment: number;
  };
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export interface SuccessPrediction {
  probability: number;
  confidence: number;
  keyFactors: string[];
  improvementSuggestions: string[];
  similarSuccessfulApplications?: any[];
}

export interface UserFeedback {
  user_id: string;
  grant_id: string;
  ai_score: number;
  user_rating: number;
  feedback_type: 'relevance' | 'accuracy' | 'completeness' | 'usefulness';
  feedback_text?: string;
  outcome_data?: any;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  userSatisfaction: number;
}

export interface AIRecommendation {
  grantId: string;
  title: string;
  score: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  compatibilityBreakdown: CompatibilityScore['breakdown'];
  successPrediction: SuccessPrediction;
}
