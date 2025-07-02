
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, User, X, Heart, Clock, DollarSign, Building, TrendingUp, FileText, Target, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useGrants } from "@/contexts/GrantContext";
import { useState } from "react";
import { toast } from "sonner";

const Discover = () => {
  const { user, logout } = useUser();
  const { getCurrentGrant, getRemainingCount, handleSwipe } = useGrants();
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [lastMatch, setLastMatch] = useState<any>(null);

  const currentGrant = getCurrentGrant();
  const remainingCount = getRemainingCount();

  const handlePass = () => {
    if (currentGrant) {
      handleSwipe(currentGrant.id, false);
      toast("Grant passed", { description: "We'll find you better matches!" });
    }
  };

  const handleInterested = () => {
    if (currentGrant) {
      handleSwipe(currentGrant.id, true);
      setLastMatch(currentGrant);
      setShowMatchModal(true);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const handleLogout = () => {
    logout();
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
                  ? `${remainingCount} more grants to review` 
                  : "No more grants for now"}
              </p>
            </div>

            {/* Grant Card or Empty State */}
            {currentGrant ? (
              <div className="flex flex-col items-center">
                <Card className="w-full max-w-md shadow-xl border-0 mb-8">
                  <CardContent className="p-6">
                    {/* Match Percentage Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {currentGrant.matchPercentage}% Match
                      </Badge>
                      <Badge className={getUrgencyColor(currentGrant.urgency)}>
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
                        <span className="text-sm">{currentGrant.organization}</span>
                      </div>
                    </div>

                    {/* Funding Amount */}
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-800">
                          {currentGrant.amount}
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">Funding Available</p>
                    </div>

                    {/* Requirements */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-slate-900 mb-2">Key Requirements:</h3>
                      <ul className="space-y-1">
                        {currentGrant.requirements.slice(0, 4).map((req, index) => (
                          <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {currentGrant.tags.map((tag, index) => (
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
                  <Link to="/profile">
                    <Button variant="outline">
                      Adjust Preferences
                    </Button>
                  </Link>
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
                <Button 
                  className="w-full bg-blue-800 hover:bg-blue-900"
                  onClick={() => {
                    setShowMatchModal(false);
                    toast.success("Great! We'll help you with the application process.");
                  }}
                >
                  Apply Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowMatchModal(false);
                    toast("Grant saved to your matches!");
                  }}
                >
                  Save for Later
                </Button>
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
