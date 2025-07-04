
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, Settings, User, TrendingUp, FileText, Target, Award, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDashboardActivity } from "@/hooks/useDashboardActivity";
import { useGrantMatching } from "@/hooks/useGrantMatching";
import { useGrantAI } from "@/hooks/useGrantAI";
import { useState, useEffect } from "react";
import ProfileSetup from "@/components/ProfileSetup";
import { profileApi } from "@/utils/api";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, logout } = useUser();
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  
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
      try {
        const response = await profileApi.get();
        if (response.error || !response.profile?.company_name) {
          setNeedsProfileSetup(true);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setNeedsProfileSetup(true);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    if (user) {
      checkProfile();
    }
  }, [user]);

  // Load AI recommendations
  useEffect(() => {
    const loadAIRecommendations = async () => {
      if (!user || needsProfileSetup) return;
      
      try {
        const businessProfile = {
          company_name: user?.company?.name || 'Demo Company',
          industry: 'Technology',
          business_size: 'Small',
          location: 'California'
        };
        
        const recommendations = await getRecommendations(businessProfile, mockGrants);
        setAiRecommendations(recommendations.recommendations || []);
      } catch (error) {
        console.error('Failed to load AI recommendations:', error);
      }
    };

    loadAIRecommendations();
  }, [user, needsProfileSetup, getRecommendations]);

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

  const getCompatibilityBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Show loading while checking profile
  if (isCheckingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
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
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G$</span>
              </div>
              <span className="text-xl font-bold text-slate-900">GrantSwipe</span>
            </Link>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search grants..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)]">
          <nav className="p-6 space-y-2">
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-blue-700 bg-blue-50 rounded-lg font-medium">
              <TrendingUp className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/discover" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Search className="h-5 w-5" />
              Discover Grants
            </Link>
            <Link to="/applications" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <FileText className="h-5 w-5" />
              My Applications
            </Link>
            <Link to="/matches" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Target className="h-5 w-5" />
              Matches
            </Link>
            <Link to="/ai-analyzer" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Brain className="h-5 w-5" />
              AI Analyzer
            </Link>
            <Link to="/ai-assistant" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <FileText className="h-5 w-5" />
              AI Assistant
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <User className="h-5 w-5" />
              Profile
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </aside>

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

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Active Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-slate-900">{stats.activeApplications.count}</div>
                      <p className="text-xs text-green-600">{stats.activeApplications.change}</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    New Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-slate-900">{stats.newMatches.count}</div>
                      <p className="text-xs text-blue-600">{stats.newMatches.change}</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-slate-900">{stats.successRate.percentage}%</div>
                      <p className="text-xs text-green-600">{stats.successRate.change}</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Total Applied
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-slate-900">{stats.totalApplied.count}</div>
                      <p className="text-xs text-slate-600">{stats.totalApplied.change}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Grant Recommendations
                </CardTitle>
                <p className="text-sm text-slate-600">Top grants matched to your business profile</p>
              </CardHeader>
              <CardContent>
                {aiLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-slate-600">Loading AI recommendations...</span>
                  </div>
                ) : aiRecommendations.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiRecommendations.slice(0, 3).map((rec) => (
                      <Card key={rec.grantId} className="border-2 hover:border-blue-200 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{rec.title}</CardTitle>
                            <Badge className={getCompatibilityBadgeColor(rec.score)}>
                              {rec.score}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-600 mb-3">{rec.reasoning}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{rec.priority}</Badge>
                            <Button size="sm" variant="outline">
                              <Brain className="h-3 w-3 mr-1" />
                              Analyze
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">Loading personalized recommendations...</p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline" 
                      size="sm"
                      className="mt-3"
                    >
                      Refresh Recommendations
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Your Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {user?.company.interests.map((interest, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">{interest}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/profile" className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-block">
                    Update preferences →
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    AI-Powered Grant Discovery
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Use AI to find grants tailored to your business profile and get personalized matches with compatibility scoring
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      className="bg-blue-800 hover:bg-blue-900 text-white"
                      onClick={handleStartSwiping}
                      disabled={grantMatchingMutation.isPending}
                    >
                      {grantMatchingMutation.isPending ? 'Finding Matches...' : 'Find Matches'}
                    </Button>
                    <Link to="/ai-analyzer">
                      <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-100">
                        <Brain className="h-4 w-4 mr-2" />
                        AI Analyzer
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    AI Application Assistant
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Get AI help writing winning grant applications with draft generation and quality analysis
                  </p>
                  <div className="flex gap-3">
                    <Link to="/ai-assistant">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <FileText className="h-4 w-4 mr-2" />
                        Start Writing
                      </Button>
                    </Link>
                    <Link to="/applications">
                      <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
                        View Applications
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
