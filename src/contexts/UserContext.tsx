
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Company {
  name: string;
  industry: string;
  size: string;
  stage: string;
  interests: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  company: Company;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would be an API call
    const mockUser: User = {
      id: "user-123",
      name: "John Smith",
      email: email,
      company: {
        name: "TechStartup Inc",
        industry: "Technology",
        size: "11-50 employees",
        stage: "Growth (3-5 years)",
        interests: ["Research & Development", "Business Expansion", "Innovation Projects"]
      }
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const signup = async (userData: any) => {
    // Mock signup - in real app, this would be an API call
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.fullName,
      email: userData.email,
      company: {
        name: userData.companyName,
        industry: userData.industry,
        size: userData.companySize,
        stage: userData.companyStage,
        interests: userData.interests
      }
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated,
      login,
      signup,
      logout,
      updateProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};
