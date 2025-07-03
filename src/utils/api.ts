
import { supabase } from "@/integrations/supabase/client";
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

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdldGtubnRxYXBucG5zeHJ6aGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTA2ODIsImV4cCI6MjA2NzEyNjY4Mn0.GitniDVrBDH4k7xybH0dwaEYpbqMeQG3i-3toSreWjo'
  };
};

// Profile Management API
export const profileApi = {
  async setup(profileData: Partial<ProfileData>): Promise<ProfileResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/profile-setup`, {
      method: 'POST',
      headers,
      body: JSON.stringify(profileData),
    });
    return response.json();
  },

  async get(): Promise<ProfileResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers,
    });
    return response.json();
  },

  async update(profileData: Partial<ProfileData>): Promise<ProfileResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData),
    });
    return response.json();
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
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount);
    if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount);
    if (filters?.deadline) params.append('deadline', filters.deadline);

    const response = await fetch(`${API_BASE_URL}/grants?${params.toString()}`, {
      method: 'GET',
      headers,
    });
    return response.json();
  },

  async findMatches(): Promise<MatchesResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/grants-match`, {
      method: 'POST',
      headers,
    });
    return response.json();
  }
};

// Matches API
export const matchesApi = {
  async getAll(): Promise<MatchesResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/matches`, {
      method: 'GET',
      headers,
    });
    return response.json();
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
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(applicationData),
    });
    return response.json();
  },

  async getAll(): Promise<ApplicationsResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'GET',
      headers,
    });
    return response.json();
  },

  async update(applicationId: string, updateData: {
    status?: string;
    applicationData?: any;
    notes?: string;
  }): Promise<ApplicationsResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/applications-update/${applicationId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData),
    });
    return response.json();
  }
};

// Dashboard API
export const dashboardApi = {
  async getStats(): Promise<DashboardStatsResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/dashboard-stats`, {
      method: 'GET',
      headers,
    });
    return response.json();
  },

  async getActivity(): Promise<DashboardActivityResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/dashboard-activity`, {
      method: 'GET',
      headers,
    });
    return response.json();
  }
};
