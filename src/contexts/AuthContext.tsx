import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: "user" | "admin";
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null; data?: any }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null; data?: any }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from database with timeout and error handling
  const loadUserProfile = async (userId: string) => {
    try {
      console.log('AuthContext: Loading profile for user:', userId);

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Profile query timeout after 10 seconds')),
          10000
        );
      });

      // Create the actual query promise
      const queryPromise = supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at, updated_at')
        .eq('id', userId)
        .limit(1);

      // Race between query and timeout
      const { data, error } = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        console.error('AuthContext: Error loading profile:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId: userId,
        });
        return null;
      }

      // Check if profile exists (data will be an array with limit(1))
      if (!data || data.length === 0) {
        console.log('AuthContext: No profile found for user:', userId);
        return null;
      }

      const profile = data[0];
      console.log('AuthContext: Profile loaded successfully:', profile);
      return profile as Profile;
    } catch (err) {
      console.error('AuthContext: Exception loading profile:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        userId: userId,
      });
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log('AuthContext: Initializing...');

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();
        console.log(
          'AuthContext: Initial session:',
          initialSession,
          'error:',
          error
        );

        if (initialSession?.user) {
          setUser(initialSession.user);
          setSession(initialSession);

          // Load user profile with timeout handling
          try {
            const userProfile = await loadUserProfile(initialSession.user.id);
            setProfile(userProfile);
          } catch (profileErr) {
            console.error(
              'AuthContext: Profile loading failed during initialization:',
              profileErr
            );
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('AuthContext: Error getting initial session:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Load user profile with timeout handling
        try {
          const userProfile = await loadUserProfile(session.user.id);
          setProfile(userProfile);
        } catch (profileErr) {
          console.error(
            'AuthContext: Profile loading failed during auth change:',
            profileErr
          );
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      console.log('AuthContext: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Sign in attempt for:', email);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('AuthContext: Sign in result:', data, 'error:', error);
      return { error, data };
    } catch (err) {
      console.error('AuthContext: Sign in exception:', err);
      return { error: err as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('AuthContext: Sign up attempt for:', email);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('AuthContext: Sign up result:', data, 'error:', error);
      return { error, data };
    } catch (err) {
      console.error('AuthContext: Sign up exception:', err);
      return { error: err as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('AuthContext: Sign out attempt');

    try {
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.clear();
      const { error } = await supabase.auth.signOut();
      console.log('AuthContext: Sign out result, error:', error);


      return { error };
    } catch (err) {
      console.error('AuthContext: Sign out exception:', err);
      return { error: err as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    console.log('AuthContext: Password reset attempt for:', email);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      console.log('AuthContext: Password reset result, error:', error);
      return { error };
    } catch (err) {
      console.error('AuthContext: Password reset exception:', err);
      return { error: err as AuthError };
    }
  };

  const updatePassword = async (newPassword: string) => {
    console.log('AuthContext: Update password attempt');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      console.log('AuthContext: Update password result, error:', error);
      return { error };
    } catch (err) {
      console.error('AuthContext: Update password exception:', err);
      return { error: err as AuthError };
    }
  };

  useEffect(() => {
    if (profile) {
      localStorage.setItem("isAdmin", JSON.stringify(profile?.role === "admin"));
    }
  }, [profile]);

  // Compute isAdmin based on profile role
  const isAdmin = profile?.role === 'admin';
  console.log('AuthContext: isAdmin computed from profile:', {
    hasUser: !!user,
    hasProfile: !!profile,
    profileRole: profile?.role,
    isAdmin: isAdmin,
  });

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
