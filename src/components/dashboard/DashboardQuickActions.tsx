
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardQuickActionsProps {
  onStartSwiping: () => void;
  isSwipingLoading: boolean;
}

const DashboardQuickActions = ({ onStartSwiping, isSwipingLoading }: DashboardQuickActionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-2 border-blue-200 bg-blue-50 w-full">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            AI-Powered Grant Discovery
          </h3>
          <p className="text-slate-600 mb-4">
            Use AI to find grants tailored to your business profile and get personalized matches with compatibility scoring
          </p>
          <div className="flex flex-wrap gap-3 min-w-0">
            <Button 
              className="bg-blue-800 hover:bg-blue-900 text-white flex-shrink-0"
              onClick={onStartSwiping}
              disabled={isSwipingLoading}
            >
              {isSwipingLoading ? 'Finding Matches...' : 'Find Matches'}
            </Button>
            <Link to="/ai-analyzer" className="flex-shrink-0">
              <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-100">
                <Brain className="h-4 w-4 mr-2" />
                AI Analyzer
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-2 border-green-200 bg-green-50 w-full">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            AI Application Assistant
          </h3>
          <p className="text-slate-600 mb-4">
            Get AI help writing winning grant applications with draft generation and quality analysis
          </p>
          <div className="flex flex-wrap gap-3 min-w-0">
            <Link to="/ai-assistant" className="flex-shrink-0">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Start Writing
              </Button>
            </Link>
            <Link to="/applications" className="flex-shrink-0">
              <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
                View Applications
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardQuickActions;
