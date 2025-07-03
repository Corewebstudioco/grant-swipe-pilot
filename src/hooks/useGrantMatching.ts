
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { grantsApi } from '@/utils/api';
import { toast } from 'sonner';

export const useGrantMatching = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: grantsApi.findMatches,
    onSuccess: (data) => {
      if (data.newMatches && data.newMatches > 0) {
        toast.success(`Found ${data.newMatches} new grant matches!`);
      } else {
        toast.info('No new matches found. Check back later for new opportunities.');
      }
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-activity'] });
    },
    onError: (error: any) => {
      console.error('Grant matching error:', error);
      toast.error('Failed to find grant matches. Please try again.');
    },
  });
};
