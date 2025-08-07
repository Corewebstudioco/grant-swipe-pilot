
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, ExternalLink, Building2 } from "lucide-react";
import { useGrantMatches } from "@/hooks/useGrantMatches";

const GrantMatches = () => {
  const { data: matches, isLoading, error } = useGrantMatches();

  const formatAmount = (amount: string) => {
    if (!amount) return 'Amount varies';
    return amount.startsWith('$') ? amount : `$${amount}`;
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'No deadline specified';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Deadline passed';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Grant Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading matches...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Grant Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-600">Unable to load grant matches</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Grant Matches
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Recommended grants based on your interests
        </p>
      </CardHeader>
      <CardContent>
        {matches && matches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((grant) => (
              <Card key={grant.id} className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base leading-tight">
                    {truncateText(grant.title, 60)}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Building2 className="h-3 w-3" />
                    {grant.agency || 'Government Agency'}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {truncateText(grant.description || 'Grant description not available', 100)}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <DollarSign className="h-3 w-3" />
                      {formatAmount(grant.amount)}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {formatDeadline(grant.deadline)}
                    </div>
                  </div>

                  {grant.category && (
                    <Badge variant="outline" className="text-xs">
                      {grant.category}
                    </Badge>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        if (grant.application_url) {
                          window.open(grant.application_url, '_blank');
                        }
                      }}
                    >
                      Apply Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (grant.application_url) {
                          window.open(grant.application_url, '_blank');
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No matches found</h3>
            <p className="text-slate-600 mb-4">
              Update your profile interests to discover relevant grants
            </p>
            <Button variant="outline" asChild>
              <a href="/profile">Update Profile</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrantMatches;
