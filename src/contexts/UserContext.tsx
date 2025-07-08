
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { profileApi } from '@/utils/api';

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
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null);

  const isAuthenticated = !!session?.user;

  // Check online status
  const [isOffline, setIsOffline] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session) {
          setSession(session);
          
          // Load user profile without blocking auth state
          setTimeout(() => {
            if (mounted && session.user) {
              loadUserProfile(session.user);
            }
          }, 0);
        } else {
          setSession(null);
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (mounted) {
          if (error) {
            console.error('Session check error:', error);
            if (!isOffline) {
              toast.error('Authentication check failed. Please refresh and try again.');
            }
          } else if (session) {
            setSession(session);
            if (session.user) {
              await loadUserProfile(session.user);
            }
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          console.error('Session initialization error:', error);
          if (!isOffline) {
            toast.error('Connection timeout. Please check your internet connection.');
          }
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
    };
  }, [isOffline]);

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('Loading user profile for:', authUser.id);
      
      const result = await profileApi.get();
      
      if (result.success && result.profile) {
        const profileData = result.profile;
        const userProfile: UserProfile = {
          id: authUser.id,
          name: profileData.company_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          company: {
            name: profileData.company_name || 'Your Company',
            industry: profileData.industry || 'Technology',
            size: profileData.business_size || '11-50 employees',
            stage: 'Growth (3-5 years)', // Default stage
            interests: profileData.interests || ['Research & Development', 'Business Expansion']
          }
        };
        setUser(userProfile);
        console.log('User profile loaded successfully');
      } else {
        // Create basic profile if none exists
        const basicProfile: UserProfile = {
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          company: {
            name: 'Your Company',
            industry: 'Technology',
            size: '11-50 employees',
            stage: 'Growth (3-5 years)',
            interests: ['Research & Development', 'Business Expansion']
          }
        };
        setUser(basicProfile);
        console.log('Created basic user profile');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Set basic profile even if there's an error
      const basicProfile: UserProfile = {
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        company: {
          name: 'Your Company',
          industry: 'Technology',
          size: '11-50 employees',
          stage: 'Growth (3-5 years)',
          interests: ['Research & Development', 'Business Expansion']
        }
      };
      setUser(basicProfile);
      
      if (error instanceof Error && error.message.includes('Authentication expired')) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => logout(), 1000);
      }
    }
  };

  const login = async (email: string, password: string) => {
    if (isOffline) {
      return { error: { message: 'You are offline. Please check your internet connection.' } };
    }

    try {
      console.log('Attempting login with Supabase');
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout')), 10000)
      );
      
      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message?.includes('too_many_requests')) {
          errorMessage = 'Too many failed attempts. Please wait a few minutes before trying again.';
        } else if (error.message?.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        return { error: { message: errorMessage, code: error.status } };
      }
      
      console.log('Login successful');
      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Login timeout. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { error: { message: errorMessage } };
    }
  };

  const signup = async (userData: any) => {
    if (isOffline) {
      return { error: { message: 'You are offline. Please check your internet connection.' } };
    }

    try {
      console.log('Attempting signup with Supabase');
      
      const redirectUrl = `${window.location.origin}/`;
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Signup timeout')), 15000)
      );
      
      const signupPromise = supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.fullName,
            company_name: userData.companyName,
            industry: userData.industry,
            company_size: userData.companySize,
            company_stage: userData.companyStage,
            interests: userData.interests
          }
        }
      });
      
      const { data, error } = await Promise.race([signupPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Signup error:', error);
        let errorMessage = 'Signup failed. Please try again.';
        
        if (error.message?.includes('already registered')) {
          errorMessage = 'An account with this email already exists.';
        } else if (error.message?.includes('Password')) {
          errorMessage = 'Password is too weak. Please choose a stronger password.';
        } else if (error.message?.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        return { error: { message: errorMessage, code: error.status } };
      }
      
      console.log('Signup successful');
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Signup timeout. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { error: { message: errorMessage } };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Logout failed. Please try again.');
      } else {
        setUser(null);
        setSession(null);
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
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
