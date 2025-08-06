
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';
import { ActivityItem } from '@/types/api';

export const useDashboardActivity = () => {
  const { isAuthenticated, session } = useUser();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: dashboardApi.getActivity,
    refetchInterval: 10 * 60 * 1000, // Reduced to 10 minutes instead of 1 minute
    enabled: isAuthenticated && !!session?.access_token,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1, // Reduce retries for faster failures
  });

  const addActivity = (newActivity: ActivityItem) => {
    queryClient.setQueryData(['dashboard-activity'], (oldData: any) => {
      if (oldData?.activities) {
        return {
          ...oldData,
          activities: [newActivity, ...oldData.activities].slice(0, 10) // Keep only latest 10
        };
      }
      return oldData;
    });
  };

  return {
    activities: query.data?.activities || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    addActivity
  };
};
