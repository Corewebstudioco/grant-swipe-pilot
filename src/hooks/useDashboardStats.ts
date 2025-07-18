
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';

export const useDashboardStats = () => {
  const { isAuthenticated, session } = useUser();
  
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 5 * 60 * 1000, // Reduced to 5 minutes instead of 30 seconds
    enabled: isAuthenticated && !!session?.access_token,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    retry: 1, // Reduce retries for faster failures
  });
};
