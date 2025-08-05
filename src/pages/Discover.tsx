
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Search, User, X, Heart, Clock, DollarSign, Building, TrendingUp, FileText, Target, Settings, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useGrantMatching } from "@/hooks/useGrantMatching";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { grantsApi, applicationsApi } from "@/utils/api";
import type { GrantData } from "@/types/api";

const Discover = () => {
  const { user, logout } = useUser();
  const [currentGrantIndex, setCurrentGrantIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [lastMatch, setLastMatch] = useState<GrantData | null>(null);
  const grantMatching = useGrantMatching();

  const [filters, setFilters] = useState({
    industry: '',
    category: '',
    fundingRange: '',
    deadlineFilter: 'all'
  });

  const { data: grantsData, isLoading } = useQuery({
    queryKey: ['grants', filters],
    queryFn: () => grantsApi.getAll(filters),
  });

  const grants = grantsData?.grants || [];
  const currentGrant = grants[currentGrantIndex];
  const remainingCount = grants.length - currentGrantIndex - 1;

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days left`;
  };

  const getUrgencyColor = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return 'bg-red-100 text-red-800';
    if (diffDays < 30) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const handlePass = () => {
    if (currentGrantIndex < grants.length - 1) {
      setCurrentGrantIndex(prev => prev + 1);
      toast("Grant passed", { description: "We'll find you better matches!" });
    }
  };

  const handleInterested = async () => {
    if (currentGrant) {
      try {
        // Create a draft application
        await applicationsApi.create({
          grantId: currentGrant.id,
          formData: {},
          notes: 'Marked as interested from discovery',
          aiAssistanceUsed: false
        });
        
        setLastMatch(currentGrant);
        setShowMatchModal(true);
        
        if (currentGrantIndex < grants.length - 1) {
          setCurrentGrantIndex(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error creating application:', error);
        toast.error('Failed to save interest. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    );
  }

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
          
          <div className="flex-1 max-w-2xl mx-8 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search grants..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
              </SelectContent>
            </Select>
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
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <TrendingUp className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/discover" className="flex items-center gap-3 px-3 py-2 text-blue-700 bg-blue-50 rounded-lg font-medium">
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Discover Your Perfect Grant
              </h1>
              <p className="text-slate-600">
                {remainingCount > 0 
                  ? `${remainingCount + 1} grants to review` 
                  : "No more grants for now"}
              </p>
            </div>

            {/* Grant Card or Empty State */}
            {currentGrant ? (
              <div className="flex flex-col items-center">
                <Card className="w-full max-w-md shadow-xl border-0 mb-8">
                  <CardContent className="p-6">
                    {/* Deadline Badge */}
                    <div className="flex justify-end items-start mb-4">
                      <Badge className={getUrgencyColor(currentGrant.deadline)}>
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDeadline(currentGrant.deadline)}
                      </Badge>
                    </div>

                    {/* Grant Title and Organization */}
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-slate-900 mb-2">
                        {currentGrant.title}
                      </h2>
                      <div className="flex items-center gap-2 text-slate-600 mb-3">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">{currentGrant.agency}</span>
                      </div>
                    </div>

                    {/* Funding Amount */}
                    {currentGrant.amount && (
                      <div className="bg-green-50 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-2xl font-bold text-green-800">
                            {currentGrant.amount}
                          </span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">Funding Available</p>
                      </div>
                    )}

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 line-clamp-4">
                        {currentGrant.description}
                      </p>
                    </div>

                    {/* Category and Industry Tags */}
                    <div className="flex flex-wrap gap-2">
                      {currentGrant.category && (
                        <Badge variant="secondary" className="text-xs">
                          {currentGrant.category}
                        </Badge>
                      )}
                      {currentGrant.industry_tags?.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePass}
                    className="w-16 h-16 rounded-full border-2 border-red-200 hover:border-red-300 hover:bg-red-50"
                  >
                    <X className="w-8 h-8 text-red-500" />
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={handleInterested}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Heart className="w-8 h-8" />
                  </Button>
                </div>

                <p className="text-sm text-slate-500 mt-4">
                  Swipe left to pass • Swipe right to show interest
                </p>
              </div>
            ) : (
              // Empty State
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  No more grants for now
                </h2>
                <p className="text-slate-600 mb-6">
                  Check back tomorrow for new opportunities, or adjust your preferences to see more matches.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => grantMatching.mutate()}
                    disabled={grantMatching.isPending}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {grantMatching.isPending ? 'Finding Matches...' : 'Find New Matches'}
                  </Button>
                  <Link to="/matches">
                    <Button className="bg-blue-800 hover:bg-blue-900">
                      View Your Matches
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Match Success Modal */}
      {showMatchModal && lastMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                It's a Match! 🎉
              </h2>
              <p className="text-slate-600 mb-4">
                You've shown interest in <strong>{lastMatch.title}</strong>
              </p>
              <div className="space-y-3">
                <Link to="/applications">
                  <Button 
                    className="w-full bg-blue-800 hover:bg-blue-900"
                    onClick={() => setShowMatchModal(false)}
                  >
                    View Applications
                  </Button>
                </Link>
                <Link to="/matches">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowMatchModal(false)}
                  >
                    View All Matches
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowMatchModal(false)}
                >
                  Continue Swiping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Discover;
