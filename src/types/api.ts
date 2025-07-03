
// API Response Types for GrantSwipe

export interface ProfileData {
  id: string;
  email: string;
  company_name: string;
  industry: string;
  business_size: string;
  interests: string[];
  location?: string;
  website?: string;
  description?: string;
  funding_needs?: string;
  previous_grants?: string[];
  created_at: string;
  updated_at: string;
}

export interface GrantData {
  id: string;
  title: string;
  agency: string;
  amount: string;
  deadline: string;
  description: string;
  eligibility: string;
  application_url: string;
  category: string;
  location_restrictions: string[];
  business_size_requirements: string[];
  industry_tags: string[];
  funding_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MatchData {
  id: string;
  user_id: string;
  grant_id: string;
  compatibility_score: number;
  ai_reasons: string[];
  eligibility_status: 'high' | 'medium' | 'low';
  application_tips: string[];
  bookmarked: boolean;
  viewed: boolean;
  created_at: string;
  grants: GrantData;
}

export interface ApplicationData {
  id: string;
  user_id: string;
  grant_id: string;
  match_id?: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  application_data: any;
  notes?: string;
  ai_assistance_used: boolean;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  grants: Partial<GrantData>;
}

export interface DashboardStats {
  activeApplications: {
    count: number;
    change: string;
  };
  newMatches: {
    count: number;
    change: string;
  };
  successRate: {
    percentage: number;
    change: string;
  };
  totalApplied: {
    count: number;
    change: string;
  };
}

export interface ActivityItem {
  id: string;
  description: string;
  timeAgo: string;
  type: 'match' | 'application' | 'reminder' | 'general';
}

// API Response Interfaces
export interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface ProfileResponse extends ApiResponse<ProfileData> {
  profile?: ProfileData;
}

export interface GrantsResponse extends ApiResponse<GrantData[]> {
  grants?: GrantData[];
}

export interface MatchesResponse extends ApiResponse<MatchData[]> {
  matches?: MatchData[];
  newMatches?: number;
  topMatches?: MatchData[];
}

export interface ApplicationsResponse extends ApiResponse<ApplicationData[]> {
  applications?: ApplicationData[];
  application?: ApplicationData;
}

export interface DashboardStatsResponse extends ApiResponse<DashboardStats> {
  stats?: DashboardStats;
}

export interface DashboardActivityResponse extends ApiResponse<ActivityItem[]> {
  activities?: ActivityItem[];
}
