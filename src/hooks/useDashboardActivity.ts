
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/utils/api';

export const useDashboardActivity = () => {
  return useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: dashboardApi.getActivity,
    refetchInterval: 60000, // Refresh every minute
  });
};
