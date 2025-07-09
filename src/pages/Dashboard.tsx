import { useUser } from "@/contexts/UserContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDashboardActivity } from "@/hooks/useDashboardActivity";
import { useGrantMatching } from "@/hooks/useGrantMatching";
import { useGrantAI } from "@/hooks/useGrantAI";
import { useState, useEffect } from "react";
import ProfileSetup from "@/components/ProfileSetup";
import { getDocument } from "@/utils/firebase";
import { toast } from "sonner";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardAIRecommendations from "@/components/dashboard/DashboardAIRecommendations";
import DashboardActivity from "@/components/dashboard/DashboardActivity";
import DashboardInterests from "@/components/dashboard/DashboardInterests";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";

const Dashboard = () => {
  const { user, session, logout, isAuthenticated } = useUser();
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  
  // Only fetch data when we have a valid session
  const shouldFetchData = isAuthenticated && session?.access_token && user;
  
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: activityData, isLoading: activityLoading } = useDashboardActivity();
  const grantMatchingMutation = useGrantMatching();
  const { getRecommendations, loading: aiLoading } = useGrantAI();

  // Mock grants for AI recommendations
  const mockGrants = [
    {
      id: '1',
      title: 'Small Business Innovation Research (SBIR)',
      agency: 'NSF',
      amount: '$500,000',
      category: 'Innovation',
      compatibilityScore: 85
    },
    {
      id: '2',
      title: 'Rural Business Development Grant',
      agency: 'USDA',
      amount: '$100,000',
      category: 'Rural Development',
      compatibilityScore: 72
    },
    {
      id: '3',
      title: 'Clean Energy Technology Grant',
      agency: 'DOE',
      amount: '$750,000',
      category: 'Clean Energy',
      compatibilityScore: 68
    }
  ];

  // Check if user needs profile setup
  useEffect(() => {
    const checkProfile = async () => {
      if (!isAuthenticated || !session?.user) {
        setIsCheckingProfile(false);
        return;
      }

      try {
        console.log('Checking profile for user:', session.user.id);
        const response = await getDocument('profiles', session.user.id);
        
        if (!response.success || !response.data?.companyName) {
          console.log('Profile setup needed');
          setNeedsProfileSetup(true);
        } else {
          console.log('Profile found:', response.data);
          setNeedsProfileSetup(false);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setNeedsProfileSetup(true);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [isAuthenticated, session?.user]);

  // Load AI recommendations only when authenticated and profile is ready
  useEffect(() => {
    const loadAIRecommendations = async () => {
      if (!shouldFetchData || needsProfileSetup) {
        console.log('Skipping AI recommendations - not ready');
        return;
      }
      
      try {
        console.log('Loading AI recommendations...');
        const businessProfile = {
          company_name: user?.company?.name || 'Demo Company',
          industry: 'Technology',
          business_size: 'Small',
          location: 'California'
        };
        
        const recommendations = await getRecommendations(businessProfile, mockGrants);
        setAiRecommendations(recommendations.recommendations || []);
        console.log('AI recommendations loaded successfully');
      } catch (error) {
        console.error('Failed to load AI recommendations:', error);
        toast.error('Failed to load AI recommendations. Please try again.');
      }
    };

    loadAIRecommendations();
  }, [shouldFetchData, needsProfileSetup, getRecommendations, user]);

  const handleStartSwiping = () => {
    grantMatchingMutation.mutate();
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleProfileSetupComplete = () => {
    setNeedsProfileSetup(false);
    toast.success('Welcome to GrantSwipe! Let\'s find some grants for you.');
  };

  const handleRefreshRecommendations = () => {
    window.location.reload();
  };

  // Show loading while checking authentication or profile
  if (!isAuthenticated || isCheckingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show profile setup if needed
  if (needsProfileSetup) {
    return <ProfileSetup onComplete={handleProfileSetupComplete} />;
  }

  const stats = statsData?.stats || {
    activeApplications: { count: 0, change: '+0 this week' },
    newMatches: { count: 0, change: 'Updated today' },
    successRate: { percentage: 0, change: 'No data yet' },
    totalApplied: { count: 0, change: 'All time' }
  };

  const activities = activityData?.activities || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader onLogout={handleLogout} />

      <div className="flex">
        <DashboardSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-slate-600">
                Ready to discover your next grant opportunity for {user?.company.name}?
              </p>
            </div>

            <DashboardStats stats={stats} isLoading={statsLoading} />

            <DashboardAIRecommendations 
              recommendations={aiRecommendations}
              isLoading={aiLoading}
              onRefresh={handleRefreshRecommendations}
            />

            {/* Recent Activity and Interests */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <DashboardActivity activities={activities} isLoading={activityLoading} />
              <DashboardInterests interests={user?.company.interests || []} />
            </div>

            <DashboardQuickActions 
              onStartSwiping={handleStartSwiping}
              isSwipingLoading={grantMatchingMutation.isPending}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
