
import { TrendingUp, Search, FileText, Target, Brain, User, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const DashboardSidebar = () => {
  const location = useLocation();
  
  const getNavItemClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "flex items-center gap-3 px-3 py-2 text-blue-700 bg-blue-50 rounded-lg font-medium"
      : "flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors";
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)]">
      <nav className="p-6 space-y-2">
        <Link to="/dashboard" className={getNavItemClass("/dashboard")}>
          <TrendingUp className="h-5 w-5" />
          Dashboard
        </Link>
        <Link to="/discover" className={getNavItemClass("/discover")}>
          <Search className="h-5 w-5" />
          Discover Grants
        </Link>
        <Link to="/applications" className={getNavItemClass("/applications")}>
          <FileText className="h-5 w-5" />
          My Applications
        </Link>
        <Link to="/matches" className={getNavItemClass("/matches")}>
          <Target className="h-5 w-5" />
          Matches
        </Link>
        <Link to="/ai-analyzer" className={getNavItemClass("/ai-analyzer")}>
          <Brain className="h-5 w-5" />
          AI Analyzer
        </Link>
        <Link to="/ai-assistant" className={getNavItemClass("/ai-assistant")}>
          <FileText className="h-5 w-5" />
          AI Assistant
        </Link>
        <Link to="/profile" className={getNavItemClass("/profile")}>
          <User className="h-5 w-5" />
          Profile
        </Link>
        <Link to="/team" className={getNavItemClass("/team")}>
          <Users className="h-5 w-5" />
          Team
        </Link>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
