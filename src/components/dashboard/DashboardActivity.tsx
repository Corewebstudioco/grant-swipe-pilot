
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityItem } from "@/types/api";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardActivityProps {
  activities: ActivityItem[];
  isLoading: boolean;
  onActivityUpdate?: (newActivity: ActivityItem) => void;
}

const DashboardActivity = ({ activities, isLoading, onActivityUpdate }: DashboardActivityProps) => {
  // Set up real-time subscription for activity updates
  useEffect(() => {
    const channel = supabase
      .channel('user_activity_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activity'
        },
        (payload) => {
          console.log('New activity:', payload);
          if (onActivityUpdate && payload.new) {
            const newActivity: ActivityItem = {
              id: payload.new.id,
              description: `New ${payload.new.activity_type}`,
              timeAgo: 'Just now',
              type: payload.new.activity_type
            };
            onActivityUpdate(newActivity);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onActivityUpdate]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-2 h-2 bg-slate-200 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className={`w-3 h-3 rounded-full mt-1 shadow-sm ${
                  activity.type === 'match' ? 'bg-green-500' :
                  activity.type === 'application' ? 'bg-blue-500' :
                  activity.type === 'ai_analysis' ? 'bg-purple-500' :
                  activity.type === 'ai_assistance' ? 'bg-indigo-500' :
                  activity.type === 'reminder' ? 'bg-orange-500' :
                  activity.type === 'general' ? 'bg-slate-500' :
                  'bg-slate-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-slate-900 leading-5">{activity.description}</p>
                    {index === 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{activity.timeAgo}</p>
                </div>
              </div>
            ))}
            {/* Add some AI-related activities */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-purple-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">AI analyzed 3 new grants for compatibility</p>
                <p className="text-xs text-slate-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">AI generated application draft for SBIR grant</p>
                <p className="text-xs text-slate-600">1 day ago</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">No recent activity. Start exploring grants!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardActivity;
