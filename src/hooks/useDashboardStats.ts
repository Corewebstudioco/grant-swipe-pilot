
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/utils/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
