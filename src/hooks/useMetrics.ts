
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

interface MetricsData {
  successRate: number;
  totalApplications: number;
  fundingSecured: number;
  avgProcessingTime: number;
}

export const useMetrics = () => {
  const { isAuthenticated, session } = useUser();

  const query = useQuery({
    queryKey: ['metrics'],
    queryFn: async (): Promise<MetricsData> => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Get all applications for the user
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const totalApplications = applications?.length || 0;
      const approvedApplications = applications?.filter(app => app.status === 'approved') || [];
      const successRate = totalApplications > 0 ? (approvedApplications.length / totalApplications) * 100 : 0;
      
      // Calculate funding secured (sum of funding_amount for approved applications)
      const fundingSecured = approvedApplications.reduce((sum, app) => {
        return sum + (parseFloat(app.funding_amount?.toString() || '0') || 0);
      }, 0);

      // Calculate average processing time for completed applications (approved or rejected)
      const completedApplications = applications?.filter(app => 
        (app.status === 'approved' || app.status === 'rejected') && 
        app.created_at && 
        app.updated_at
      ) || [];

      let avgProcessingTime = 0;
      if (completedApplications.length > 0) {
        const totalProcessingDays = completedApplications.reduce((sum, app) => {
          const created = new Date(app.created_at);
          const updated = new Date(app.updated_at);
          const diffTime = Math.abs(updated.getTime() - created.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);
        
        avgProcessingTime = totalProcessingDays / completedApplications.length;
      }

      return {
        successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
        totalApplications,
        fundingSecured,
        avgProcessingTime: Math.round(avgProcessingTime * 100) / 100 // Round to 2 decimal places
      };
    },
    enabled: isAuthenticated && !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    metrics: query.data || {
      successRate: 0,
      totalApplications: 0,
      fundingSecured: 0,
      avgProcessingTime: 0
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
