
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface DashboardInterestsProps {
  interests: string[];
}

const DashboardInterests = ({ interests }: DashboardInterestsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Your Interests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {interests.map((interest, index) => (
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
  );
};

export default DashboardInterests;
