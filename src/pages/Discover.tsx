
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Clock, DollarSign, Building, Filter, X } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Discover Your Perfect Grant
            </h1>
            <p className="text-slate-600">
              {remainingCount > 0 
                ? `${remainingCount + 1} grants to review` 
                : "No more grants for now"}
            </p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4">
          <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="education">Education</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="innovation">Innovation</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.fundingRange} onValueChange={(value) => setFilters(prev => ({ ...prev, fundingRange: value }))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Funding range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-50000">$0 - $50K</SelectItem>
              <SelectItem value="50000-100000">$50K - $100K</SelectItem>
              <SelectItem value="100000+">$100K+</SelectItem>
            </SelectContent>
          </Select>

          {(filters.industry || filters.category || filters.fundingRange) && (
            <Button
              variant="outline"
              onClick={() => setFilters({ industry: '', category: '', fundingRange: '', deadlineFilter: 'all' })}
              className="flex items-center gap-2"
            >
              Clear Filters
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Grant Card or Empty State */}
      <div className="max-w-4xl mx-auto">
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
              <Filter className="w-12 h-12 text-slate-400" />
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
