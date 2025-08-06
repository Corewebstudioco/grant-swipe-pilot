
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import DashboardActivity from "@/components/dashboard/DashboardActivity";
import DashboardAIRecommendations from "@/components/dashboard/DashboardAIRecommendations";

const Dashboard = () => {
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

      <DashboardStats />
      
      <div className="grid lg:grid-cols-2 gap-8">
        <DashboardQuickActions />
        <DashboardActivity />
      </div>
      
      <DashboardAIRecommendations />
    </div>
  );
};

export default Dashboard;
