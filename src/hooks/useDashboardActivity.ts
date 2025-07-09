
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';

export const useDashboardActivity = () => {
  const { isAuthenticated, session } = useUser();
  
  return useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: dashboardApi.getActivity,
    refetchInterval: 60000, // Refresh every minute
    enabled: isAuthenticated && !!session?.access_token, // Only run when authenticated
  });
};
