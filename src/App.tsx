
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { GrantProvider } from "@/contexts/GrantContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Applications from "./pages/Applications";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import Documents from "./pages/Documents";
import TeamManagement from "./pages/TeamManagement";
import AIGrantAnalyzer from "./components/AIGrantAnalyzer";
import AIApplicationAssistant from "./components/AIApplicationAssistant";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <GrantProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected routes with shared layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="discover" element={<Discover />} />
                <Route path="applications" element={<Applications />} />
                <Route path="matches" element={<Matches />} />
                <Route path="ai-analyzer" element={<AIGrantAnalyzer />} />
                <Route path="ai-assistant" element={<AIApplicationAssistant />} />
                <Route path="profile" element={<Profile />} />
                <Route path="documents" element={<Documents />} />
                <Route path="team" element={<TeamManagement />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GrantProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
