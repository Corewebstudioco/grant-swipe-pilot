
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';

export const useDashboardStats = () => {
  const { isAuthenticated, session } = useUser();
  
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: isAuthenticated && !!session?.access_token, // Only run when authenticated
  });
};
