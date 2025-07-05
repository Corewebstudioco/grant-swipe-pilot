
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Target, Award, TrendingUp } from "lucide-react";
import { DashboardStats as StatsType } from "@/types/api";

interface DashboardStatsProps {
  stats: StatsType;
  isLoading: boolean;
}

const DashboardStats = ({ stats, isLoading }: DashboardStatsProps) => {
  const StatCard = ({ title, icon: Icon, count, change, isLoading }: any) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-slate-900">{count}</div>
            <p className="text-xs text-green-600">{change}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Active Applications"
        icon={FileText}
        count={stats.activeApplications.count}
        change={stats.activeApplications.change}
        isLoading={isLoading}
      />
      <StatCard
        title="New Matches"
        icon={Target}
        count={stats.newMatches.count}
        change={stats.newMatches.change}
        isLoading={isLoading}
      />
      <StatCard
        title="Success Rate"
        icon={Award}
        count={`${stats.successRate.percentage}%`}
        change={stats.successRate.change}
        isLoading={isLoading}
      />
      <StatCard
        title="Total Applied"
        icon={TrendingUp}
        count={stats.totalApplied.count}
        change={stats.totalApplied.change}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardStats;
