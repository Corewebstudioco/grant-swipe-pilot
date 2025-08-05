import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { ActivityItem } from '@/types/api';

export const useRealtimeActivity = (initialActivities: ActivityItem[] = []) => {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_activity_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activity',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time activity update:', payload);
          if (payload.new) {
            const newActivity: ActivityItem = {
              id: payload.new.id,
              description: formatActivityDescription(payload.new),
              timeAgo: 'Just now',
              type: payload.new.activity_type
            };
            
            setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only latest 10
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  return activities;
};

const formatActivityDescription = (activity: any): string => {
  switch (activity.activity_type) {
    case 'match':
      return `New grant match found`;
    case 'application':
      return `Application ${activity.metadata?.status || 'updated'}`;
    case 'reminder':
      return `Deadline reminder for grant`;
    case 'ai_analysis':
      return `AI completed grant analysis`;
    case 'ai_assistance':
      return `AI assistance provided`;
    default:
      return `New activity recorded`;
  }
};