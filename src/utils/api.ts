
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  ProfileData,
  GrantData,
  MatchData,
  ApplicationData,
  DashboardStats,
  ActivityItem,
  ProfileResponse,
  GrantsResponse,
  MatchesResponse,
  ApplicationsResponse,
  DashboardStatsResponse,
  DashboardActivityResponse
} from "@/types/api";

const API_BASE_URL = "https://getknntqapnpnsxrzhkb.supabase.co/functions/v1";

// Helper function to get auth headers with timeout and error handling
const getAuthHeaders = async (timeoutMs = 5000) => {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), timeoutMs)
    );
    
    const authPromise = supabase.auth.getSession();
    const { data: { session }, error } = await Promise.race([authPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error('Auth session error:', error);
      throw new Error('Authentication failed');
    }
    
    if (!session?.access_token) {
      console.error('No access token found');
      throw new Error('Authentication expired. Please refresh and login again.');
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdldGtubnRxYXBucG5zeHJ6aGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTA2ODIsImV4cCI6MjA2NzEyNjY4Mn0.GitniDVrBDH4k7xybH0dwaEYpbqMeQG3i-3toSreWjo'
    };
  } catch (error) {
    console.error('Failed to get auth headers:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      toast.error("Connection timeout. Please check your internet connection.");
    } else if (error instanceof Error) {
      toast.error(error.message);
    }
    throw error;
  }
};

// Generic API call wrapper with timeout and error handling
const makeApiCall = async (url: string, options: RequestInit = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API call failed: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication expired. Please refresh and login again.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`API error: ${response.statusText}`);
      }
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('API call timeout:', url);
        throw new Error('Request timeout. Please try again.');
      }
      console.error('API call error:', error);
      throw error;
    }
    
    throw new Error('Unknown API error occurred');
  }
};

// Profile Management API
export const profileApi = {
  async setup(profileData: Partial<ProfileData>): Promise<ProfileResponse> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/profile-setup`, {
        method: 'POST',
        headers,
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      console.error('Profile setup failed:', error);
      throw error;
    }
  },

  async get(): Promise<ProfileResponse> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers,
      });
    } catch (error) {
      console.error('Profile fetch failed:', error);
      throw error;
    }
  },

  async update(profileData: Partial<ProfileData>): Promise<ProfileResponse> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }
};

// Grant Discovery API
export const grantsApi = {
  async getAll(filters?: {
    category?: string;
    minAmount?: string;
    maxAmount?: string;
    deadline?: string;
  }): Promise<GrantsResponse> {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.minAmount) params.append('minAmount', filters.minAmount);
      if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount);
      if (filters?.deadline) params.append('deadline', filters.deadline);

      return await makeApiCall(`${API_BASE_URL}/grants?${params.toString()}`, {
        method: 'GET',
        headers,
      });
    } catch (error) {
      console.error('Grants fetch failed:', error);
      throw error;
    }
  },

  async findMatches(): Promise<MatchesResponse> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/grants-match`, {
        method: 'POST',
        headers,
      });
    } catch (error) {
      console.error('Grant matching failed:', error);
      throw error;
    }
  }
};

// Matches API
export const matchesApi = {
  async getAll(): Promise<MatchesResponse> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/matches`, {
        method: 'GET',
        headers,
      });
    } catch (error) {
      console.error('Matches fetch failed:', error);
      throw error;
    }
  }
};

// Applications API
export const applicationsApi = {
  async create(applicationData: {
    grantId: string;
    matchId?: string;
    formData: any;
    notes?: string;
    aiAssistanceUsed?: boolean;
  }): Promise<ApplicationsResponse> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(applicationData),
      });
    } catch (error) {
      console.error('Application creation failed:', error);
      throw error;
    }
  },

  async getAll(): Promise<ApplicationsResponse> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/applications`, {
        method: 'GET',
        headers,
      });
    } catch (error) {
      console.error('Applications fetch failed:', error);
      throw error;
    }
  },

  async update(applicationId: string, updateData: {
    status?: string;
    applicationData?: any;
    notes?: string;
  }): Promise<ApplicationsResponse> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/applications-update/${applicationId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Application update failed:', error);
      throw error;
    }
  }
};

// Dashboard API
export const dashboardApi = {
  async getStats(): Promise<DashboardStatsResponse> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/dashboard-stats`, {
        method: 'GET',
        headers,
      }, 8000); // Shorter timeout for dashboard
    } catch (error) {
      console.error('Dashboard stats fetch failed:', error);
      // Return fallback data for dashboard
      return {
        success: false,
        data: {
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          totalMatches: 0,
          viewedMatches: 0,
          bookmarkedMatches: 0
        },
        error: error instanceof Error ? error.message : 'Failed to load dashboard stats'
      };
    }
  },

  async getActivity(): Promise<DashboardActivityResponse> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/dashboard-activity`, {
        method: 'GET',
        headers,
      }, 8000); // Shorter timeout for dashboard
    } catch (error) {
      console.error('Dashboard activity fetch failed:', error);
      // Return fallback data for dashboard
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to load dashboard activity'
      };
    }
  }
};

// AI API
export const aiApi = {
  async analyzeGrant(businessProfile: any, grantDetails: any): Promise<any> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/ai-analyze-grant`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ businessProfile, grantDetails }),
      }, 15000); // Longer timeout for AI calls
    } catch (error) {
      console.error('AI grant analysis failed:', error);
      throw error;
    }
  },

  async getRecommendations(businessProfile: any, availableGrants: any[]): Promise<any> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/ai-recommendations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ businessProfile, availableGrants }),
      }, 15000); // Longer timeout for AI calls
    } catch (error) {
      console.error('AI recommendations failed:', error);
      // Return fallback for recommendations
      return {
        success: false,
        recommendations: [],
        error: error instanceof Error ? error.message : 'Failed to get AI recommendations'
      };
    }
  },

  async getApplicationGuidance(grantDetails: any, businessProfile: any): Promise<any> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/ai-application-guidance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ grantDetails, businessProfile }),
      }, 15000);
    } catch (error) {
      console.error('AI application guidance failed:', error);
      throw error;
    }
  },

  async generateApplicationDraft(grantDetails: any, businessProfile: any, section: string): Promise<any> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/ai-draft-application`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ grantDetails, businessProfile, section }),
      }, 20000);
    } catch (error) {
      console.error('AI draft generation failed:', error);
      throw error;
    }
  },

  async analyzeApplication(applicationData: any, grantRequirements: any): Promise<any> {
    try {
      const headers = await getAuthHeaders();
      return await makeApiCall(`${API_BASE_URL}/ai-analyze-application`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ applicationData, grantRequirements }),
      }, 15000);
    } catch (error) {
      console.error('AI application analysis failed:', error);
      throw error;
    }
  }
};
