
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, FileText, DollarSign, Clock } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";

const DashboardMetrics = () => {
  const { metrics, isLoading } = useMetrics();

  const MetricCard = ({ title, icon: Icon, value, suffix = "", isLoading }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    value: number;
    suffix?: string;
    isLoading: boolean;
  }) => (
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
          </div>
        ) : (
          <div className="text-2xl font-bold text-slate-900">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Success Rate"
        icon={TrendingUp}
        value={metrics.successRate}
        suffix="%"
        isLoading={isLoading}
      />
      <MetricCard
        title="Total Applications"
        icon={FileText}
        value={metrics.totalApplications}
        isLoading={isLoading}
      />
      <MetricCard
        title="Funding Secured"
        icon={DollarSign}
        value={metrics.fundingSecured}
        suffix=""
        isLoading={isLoading}
      />
      <MetricCard
        title="Avg Processing Time"
        icon={Clock}
        value={metrics.avgProcessingTime}
        suffix=" days"
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardMetrics;
