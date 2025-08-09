
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivities } from "@/hooks/useActivities";
import { Clock, FileText, UserCheck, Target, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const getActivityIcon = (actionType: string) => {
  switch (actionType) {
    case 'application_submitted':
      return <FileText className="h-4 w-4" />;
    case 'grant_matched':
      return <Target className="h-4 w-4" />;
    case 'profile_updated':
      return <UserCheck className="h-4 w-4" />;
    case 'reminder':
      return <Bell className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getActivityColor = (actionType: string) => {
  switch (actionType) {
    case 'application_submitted':
      return 'bg-blue-500';
    case 'grant_matched':
      return 'bg-green-500';
    case 'profile_updated':
      return 'bg-purple-500';
    case 'reminder':
      return 'bg-orange-500';
    default:
      return 'bg-slate-500';
  }
};

const DashboardActivityFeed = () => {
  const { activities, isLoading } = useActivities();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getActivityColor(activity.action_type)}`}>
                  {getActivityIcon(activity.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-slate-900 leading-5">
                      {activity.message}
                    </p>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {activity.action_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm text-slate-600">No activity yet</p>
            <p className="text-xs text-slate-500 mt-1">Your actions will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardActivityFeed;
