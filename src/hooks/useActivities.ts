
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface Activity {
  id: string;
  action_type: string;
  message: string;
  metadata?: any;
  created_at: string;
}

export const useActivities = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!user,
  });

  const addActivityMutation = useMutation({
    mutationFn: async ({ action_type, message, metadata }: { 
      action_type: string; 
      message: string; 
      metadata?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          action_type,
          message,
          metadata
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const addActivity = (action_type: string, message: string, metadata?: any) => {
    addActivityMutation.mutate({ action_type, message, metadata });
  };

  return {
    activities,
    isLoading,
    error,
    addActivity
  };
};
