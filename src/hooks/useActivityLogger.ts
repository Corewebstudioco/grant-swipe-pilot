import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

interface LogActivityParams {
  activity_type: string;
  metadata?: any;
  grant_id?: string;
}

export const useActivityLogger = () => {
  const { user } = useUser();

  const logActivityMutation = useMutation({
    mutationFn: async ({ activity_type, metadata, grant_id }: LogActivityParams) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('log-activity', {
        body: {
          activity_type,
          metadata,
          grant_id
        }
      });

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Failed to log activity:', error);
    }
  });

  const logActivity = (activity_type: string, metadata?: any, grant_id?: string) => {
    logActivityMutation.mutate({ activity_type, metadata, grant_id });
  };

  // Convenience methods for common activities
  const logApplicationSubmit = (grantTitle: string, grantId?: string) => {
    logActivity('application_submit', { grant_title: grantTitle }, grantId);
  };

  const logApplicationDraft = (grantTitle: string, grantId?: string) => {
    logActivity('application_draft', { grant_title: grantTitle }, grantId);
  };

  const logDocumentUpload = (fileName: string, fileType: string) => {
    logActivity('document_upload', { file_name: fileName, file_type: fileType });
  };

  const logTeamInvite = (email: string, role: string) => {
    logActivity('team_invite', { email, role });
  };

  const logAIAnalysis = (grantTitle?: string, grantId?: string) => {
    logActivity('ai_analysis', { grant_title: grantTitle }, grantId);
  };

  const logAIAssistance = (type: string, details?: any) => {
    logActivity('ai_assistance', { type, ...details });
  };

  const logGrantView = (grantTitle: string, grantId: string) => {
    logActivity('grant_view', { grant_title: grantTitle }, grantId);
  };

  const logGrantBookmark = (grantTitle: string, grantId: string) => {
    logActivity('grant_bookmark', { grant_title: grantTitle }, grantId);
  };

  const logProfileUpdate = (changes: string[]) => {
    logActivity('profile_update', { changes });
  };

  return {
    logActivity,
    logApplicationSubmit,
    logApplicationDraft,
    logDocumentUpload,
    logTeamInvite,
    logAIAnalysis,
    logAIAssistance,
    logGrantView,
    logGrantBookmark,
    logProfileUpdate,
    isLogging: logActivityMutation.isPending
  };
};