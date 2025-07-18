
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';

export const useDashboardActivity = () => {
  const { isAuthenticated, session } = useUser();
  
  return useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: dashboardApi.getActivity,
    refetchInterval: 10 * 60 * 1000, // Reduced to 10 minutes instead of 1 minute
    enabled: isAuthenticated && !!session?.access_token,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1, // Reduce retries for faster failures
  });
};
