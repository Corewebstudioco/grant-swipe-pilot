
import { Button } from "@/components/ui/button";
import { Bell, Search, User } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  onLogout: () => void;
}

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  return (
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
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
