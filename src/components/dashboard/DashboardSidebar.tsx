
import { TrendingUp, Search, FileText, Target, Brain, User, Settings, Users } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardSidebar = () => {
  return (
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
        <Link to="/team" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Users className="h-5 w-5" />
          Team
        </Link>
        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
