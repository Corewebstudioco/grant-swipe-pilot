
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface AIRecommendation {
  grantId: string;
  title: string;
  score: number;
  reasoning: string;
  priority: string;
}

interface DashboardAIRecommendationsProps {
  recommendations: AIRecommendation[];
  isLoading: boolean;
  onRefresh: () => void;
}

const DashboardAIRecommendations = ({ recommendations, isLoading, onRefresh }: DashboardAIRecommendationsProps) => {
  const getCompatibilityBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Grant Recommendations
        </CardTitle>
        <p className="text-sm text-slate-600">Top grants matched to your business profile</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading AI recommendations...</span>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => (
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
              onClick={onRefresh} 
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
  );
};

export default DashboardAIRecommendations;
