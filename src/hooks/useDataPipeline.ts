
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDataPipeline = () => {
  const queryClient = useQueryClient();

  const pipelineStats = useQuery({
    queryKey: ['pipeline-stats'],
    queryFn: async () => {
      // Get pipeline logs summary
      const { data: logs, error: logsError } = await supabase
        .from('pipeline_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      // Get data sources status
      const { data: sources, error: sourcesError } = await supabase
        .from('data_sources')
        .select('*');

      if (sourcesError) throw sourcesError;

      // Get grant opportunities count
      const { count: totalGrants } = await supabase
        .from('grant_opportunities')
        .select('*', { count: 'exact', head: true });

      // Get active grants count
      const { count: activeGrants } = await supabase
        .from('grant_opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      return {
        logs: logs || [],
        sources: sources || [],
        totalGrants: totalGrants || 0,
        activeGrants: activeGrants || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const syncGrants = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-grants', {
        method: 'POST',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Successfully synced ${data.recordsProcessed} grants!`);
      queryClient.invalidateQueries({ queryKey: ['pipeline-stats'] });
      queryClient.invalidateQueries({ queryKey: ['grants'] });
    },
    onError: (error: any) => {
      console.error('Grant sync error:', error);
      toast.error('Failed to sync grants. Please try again.');
    },
  });

  return {
    pipelineStats,
    syncGrants,
  };
};
