
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  name: string;
  industry: string;
  size: string;
  stage: string;
  interests: string[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: Company;
}

interface UserContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (userData: any) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!session?.user;

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile from our profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const userProfile: UserProfile = {
              id: profile.id,
              name: profile.full_name || profile.email?.split('@')[0] || 'User',
              email: profile.email || session.user.email || '',
              company: {
                name: profile.company_name || 'Your Company',
                industry: profile.industry || 'Technology',
                size: profile.business_size || '11-50 employees',
                stage: profile.company_stage || 'Growth (3-5 years)',
                interests: profile.interests || ['Research & Development', 'Business Expansion']
              }
            };
            setUser(userProfile);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signup = async (userData: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: userData.fullName,
          company_name: userData.companyName,
          industry: userData.industry,
          business_size: userData.companySize,
          company_stage: userData.companyStage,
          interests: userData.interests
        }
      }
    });
    
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      session,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      updateProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};
