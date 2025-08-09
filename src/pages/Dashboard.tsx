
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import DashboardActivity from "@/components/dashboard/DashboardActivity";
import DashboardActivityFeed from "@/components/dashboard/DashboardActivityFeed";
import DashboardAIRecommendations from "@/components/dashboard/DashboardAIRecommendations";
import GrantMatches from "@/components/dashboard/GrantMatches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDashboardActivity } from "@/hooks/useDashboardActivity";

const Dashboard = () => {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { activities, isLoading: activitiesLoading, addActivity } = useDashboardActivity();

  const handleStartSwiping = () => {
    console.log('Starting grant swiping...');
    // Add logic for starting the swiping process
  };

  const handleRefreshRecommendations = () => {
    console.log('Refreshing AI recommendations...');
    // Add logic for refreshing recommendations
  };

  // Mock recommendations data - replace with actual data fetch
  const mockRecommendations = [
    {
      grantId: '1',
      title: 'Small Business Innovation Research (SBIR)',
      score: 92,
      reasoning: 'Perfect match for your technology sector and R&D focus',
      priority: 'High Priority'
    },
    {
      grantId: '2',
      title: 'Manufacturing Extension Partnership',
      score: 78,
      reasoning: 'Good fit for manufacturing efficiency improvements',
      priority: 'Medium Priority'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back! 👋
        </h1>
        <p className="text-slate-600">
          Ready to discover your next grant opportunity?
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <DashboardStats stats={stats} isLoading={statsLoading} />
          
          <div className="grid lg:grid-cols-2 gap-8">
            <DashboardQuickActions 
              onStartSwiping={handleStartSwiping}
              isSwipingLoading={false}
            />
            <DashboardActivity 
              activities={activities}
              isLoading={activitiesLoading}
              onActivityUpdate={addActivity}
            />
          </div>
          
          <GrantMatches />
          
          <DashboardAIRecommendations 
            recommendations={mockRecommendations}
            isLoading={false}
            onRefresh={handleRefreshRecommendations}
          />
        </TabsContent>
        
        <TabsContent value="metrics">
          <DashboardMetrics />
        </TabsContent>

        <TabsContent value="activity">
          <DashboardActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
