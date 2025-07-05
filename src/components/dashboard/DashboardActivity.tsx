
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityItem } from "@/types/api";

interface DashboardActivityProps {
  activities: ActivityItem[];
  isLoading: boolean;
}

const DashboardActivity = ({ activities, isLoading }: DashboardActivityProps) => {
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
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'match' ? 'bg-green-500' :
                  activity.type === 'application' ? 'bg-blue-500' :
                  activity.type === 'ai_analysis' ? 'bg-purple-500' :
                  activity.type === 'ai_assistance' ? 'bg-indigo-500' :
                  activity.type === 'reminder' ? 'bg-orange-500' :
                  'bg-slate-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                  <p className="text-xs text-slate-600">{activity.timeAgo}</p>
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
