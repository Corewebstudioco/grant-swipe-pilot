
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { signInUser, signOutUser, createUser } from '@/utils/firebaseAuth';
import { getDocument } from '@/utils/firebase';

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
  firebaseUser: User | null;
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
  const { user: firebaseUser, loading: authLoading, error: authError } = useFirebaseAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!firebaseUser;

  useEffect(() => {
    const loadUserProfile = async () => {
      if (firebaseUser) {
        try {
          // Try to get user profile from Firestore
          const profileResult = await getDocument('profiles', firebaseUser.uid);
          
          if (profileResult.success && profileResult.data) {
            const profileData = profileResult.data;
            const userProfile: UserProfile = {
              id: firebaseUser.uid,
              name: profileData.companyName || firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              company: {
                name: profileData.companyName || 'Your Company',
                industry: profileData.industry || 'Technology',
                size: profileData.businessSize || '11-50 employees',
                stage: profileData.companyStage || 'Growth (3-5 years)',
                interests: profileData.interests || ['Research & Development', 'Business Expansion']
              }
            };
            setUser(userProfile);
          } else {
            // No profile found, create basic user profile
            const basicProfile: UserProfile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              company: {
                name: 'Your Company',
                industry: 'Technology',
                size: '11-50 employees',
                stage: 'Growth (3-5 years)',
                interests: ['Research & Development', 'Business Expansion']
              }
            };
            setUser(basicProfile);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Set basic profile even if there's an error
          const basicProfile: UserProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            company: {
              name: 'Your Company',
              industry: 'Technology',
              size: '11-50 employees',
              stage: 'Growth (3-5 years)',
              interests: ['Research & Development', 'Business Expansion']
            }
          };
          setUser(basicProfile);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    if (!authLoading) {
      if (authError) {
        console.error('Firebase Auth error:', authError);
        setIsLoading(false);
      } else {
        loadUserProfile();
      }
    }
  }, [firebaseUser, authLoading, authError]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInUser(email, password);
      return { error: result.success ? null : result.error };
    } catch (error) {
      console.error('Login error in context:', error);
      return { error: { message: 'An unexpected error occurred during login' } };
    }
  };

  const signup = async (userData: any) => {
    try {
      const result = await createUser(userData.email, userData.password, {
        displayName: userData.fullName,
        companyName: userData.companyName,
        industry: userData.industry,
        companySize: userData.companySize,
        companyStage: userData.companyStage,
        interests: userData.interests
      });
      return { error: result.success ? null : result.error };
    } catch (error) {
      console.error('Signup error in context:', error);
      return { error: { message: 'An unexpected error occurred during signup' } };
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
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
      firebaseUser,
      isAuthenticated,
      isLoading: authLoading || isLoading,
      login,
      signup,
      logout,
      updateProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};
