'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'> & {
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { username: string; full_name: string }) => Promise<User>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearError = useCallback(() => setError(null), []);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      if (!userId) {
        console.error('No user ID provided to fetchProfile');
        return null;
      }
      
      console.log('Fetching profile for user ID:', userId);
      const { data, error: profileError, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code,
          status
        });
        
        // If profile doesn't exist, try to create a basic one
        if (status === 406) { // 406 is returned when no rows are found
          console.log('Profile not found, attempting to create a basic one...');
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                { 
                  id: userId,
                  email: userData.user.email,
                  username: `user_${Math.random().toString(36).substring(2, 10)}`,
                  full_name: 'New User',
                  updated_at: new Date().toISOString()
                }
              ])
              .select()
              .single();
              
            if (createError) {
              console.error('Failed to create basic profile:', createError);
              throw createError;
            }
            
            console.log('Created basic profile:', newProfile);
            setProfile(newProfile as Profile);
            return newProfile as Profile;
          }
        }
        
        throw profileError;
      }

      if (!data) {
        console.warn('No profile data found for user ID:', userId);
        setProfile(null);
        return null;
      }

      console.log('Profile data retrieved:', data);
      const profileData = {
        ...data,
        email: data.email || '',
        username: data.username || `user_${Math.random().toString(36).substring(2, 10)}`,
        full_name: data.full_name || 'New User',
      };
      
      setProfile(profileData);
      return profileData;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      setError('Failed to load user profile');
      setProfile(null);
      return null;
    }
  }, []);

  const signUp = async (email: string, password: string, userData: { username?: string; full_name?: string } = {}) => {
    try {
      setLoading(true);
      clearError();
      console.log('Starting sign up process...');
      
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const trimmedEmail = email?.toString().trim() || '';
      const trimmedPassword = password?.toString().trim() || '';
      const trimmedUsername = userData?.username?.toString().trim() || `user_${Math.random().toString(36).substring(2, 10)}`;
      const trimmedFullName = userData?.full_name?.toString().trim() || 'New User';
      
      if (!trimmedEmail || !trimmedPassword) {
        throw new Error('Email and password cannot be empty');
      }
      
      console.log('Attempting to sign up with email:', trimmedEmail);
      
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          data: {
            username: trimmedUsername,
            full_name: trimmedFullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Auth error during sign up:', error);
        throw new Error(`Authentication failed: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('No user data returned after sign up');
      }

      console.log('User signed up successfully, creating profile...');
      
      // Let's use fetchProfile which now has better error handling and fallback
      const profile = await fetchProfile(data.user.id);
      
      if (!profile) {
        console.warn('Profile not created automatically, trying manual creation...');
        
        // If fetchProfile didn't create a profile, try creating one manually
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: trimmedEmail,
              username: trimmedUsername,
              full_name: trimmedFullName,
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();
          
        if (createError) {
          console.error('Manual profile creation failed:', createError);
          throw new Error(`Profile creation failed: ${createError.message}`);
        }
        
        console.log('Manually created profile:', newProfile);
        setProfile(newProfile as Profile);
      } else {
        console.log('Profile created successfully through fetchProfile:', profile);
      }
      
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Sign up error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      console.log('Attempting to sign in with email:', email);
      
      // Clear any existing sessions first
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Auth error during sign in:', error);
        throw error;
      }

      if (!data.session) {
        throw new Error('No session returned after sign in');
      }

      console.log('Sign in successful, session:', data.session);
      
      // Update user state and fetch profile
      setUser(data.session.user);
      const profile = await fetchProfile(data.session.user.id);
      
      if (!profile) {
        console.warn('Profile not found after sign in');
        // Don't throw here, as the user is authenticated but profile might be missing
      }

      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Sign in error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      clearError();
      console.log('Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setProfile(null);
      
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user) {
      console.log('No user logged in, skipping profile refresh');
      return null;
    }
    
    try {
      console.log('Refreshing profile for user:', user.id);
      return await fetchProfile(user.id);
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError('Failed to refresh profile');
      return null;
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        console.log('Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User found, fetching profile...');
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated, fetching profile...');
          await fetchProfile(session.user.id);
          if (window.location.pathname === '/login') {
            console.log('Redirecting to dashboard...');
            navigate('/dashboard');
          }
        } else {
          console.log('No user session, clearing profile');
          setProfile(null);
          if (window.location.pathname.startsWith('/dashboard')) {
            console.log('Redirecting to login...');
            navigate('/login');
          }
        }
      }
    );

    return () => {
      console.log('Cleaning up auth subscription');
      subscription?.unsubscribe();
    };
  }, [fetchProfile, navigate]);

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
