
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useUser } from '@/contexts/UserContext';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useUser();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader onLogout={logout} />
      
      <div className="flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out
          md:relative md:top-0 md:h-[calc(100vh-73px)] md:translate-x-0 md:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <DashboardSidebar />
        </div>
        
        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-73px)]">
          {/* Mobile menu button */}
          <div className="md:hidden p-4 border-b border-slate-200 bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="flex items-center gap-2"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              {sidebarOpen ? 'Close Menu' : 'Open Menu'}
            </Button>
          </div>
          
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
