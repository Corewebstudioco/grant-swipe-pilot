import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Search, Settings, User, TrendingUp, FileText, Target, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useGrants } from "@/contexts/GrantContext";

const Dashboard = () => {
  const { user, logout } = useUser();
  const { matches } = useGrants();

  const handleLogout = async () => {
    await logout();
  };

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
                  <div className="text-2xl font-bold text-slate-900">3</div>
                  <p className="text-xs text-green-600">+1 this week</p>
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
                  <div className="text-2xl font-bold text-slate-900">{matches.length}</div>
                  <p className="text-xs text-blue-600">Updated today</p>
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
                  <div className="text-2xl font-bold text-slate-900">85%</div>
                  <p className="text-xs text-green-600">Above average</p>
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
                  <div className="text-2xl font-bold text-slate-900">12</div>
                  <p className="text-xs text-slate-600">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">New match: Small Business Innovation Grant</p>
                        <p className="text-xs text-slate-600">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Application submitted: Tech Development Fund</p>
                        <p className="text-xs text-slate-600">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Deadline reminder: Export Development Grant</p>
                        <p className="text-xs text-slate-600">5 days remaining</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Match found: Cybersecurity Innovation Fund</p>
                        <p className="text-xs text-slate-600">1 week ago</p>
                      </div>
                    </div>
                  </div>
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
                    Start Discovering Grants
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Swipe through grants tailored to your business profile and find your perfect match
                  </p>
                  <Link to="/discover">
                    <Button className="bg-blue-800 hover:bg-blue-900 text-white">
                      Start Swiping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    View All Applications
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Review the status of your submitted applications and track your progress
                  </p>
                  <Link to="/applications">
                    <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
                      View Applications
                    </Button>
                  </Link>
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
