'use client';

/**
 * Authentication Context
 *
 * Provides Supabase authentication state and methods throughout the app.
 * Handles user sessions, login/logout, and auth state changes.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
}

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'github' | 'google') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setState(prev => ({ ...prev, error, isLoading: false }));
          return;
        }

        setState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Auth initialization error:', err);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          isLoading: false,
        }));

        // Handle specific events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ ...prev, error, isLoading: false }));
    }

    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setState(prev => ({ ...prev, error, isLoading: false }));
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }

    return { error };
  };

  const signInWithOAuth = async (provider: 'github' | 'google') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setState(prev => ({ ...prev, error, isLoading: false }));
    }

    return { error };
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { error } = await supabase.auth.signOut();

    if (error) {
      setState(prev => ({ ...prev, error, isLoading: false }));
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setState(prev => ({ ...prev, isLoading: false }));

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithEmail,
        signUpWithEmail,
        signInWithOAuth,
        signOut,
        resetPassword,
      }}
    >
      {children}
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

// Export a hook for checking if user is authenticated
export function useIsAuthenticated() {
  const { user, isLoading } = useAuth();
  return { isAuthenticated: !!user, isLoading };
}

// Export a hook for requiring authentication
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = redirectTo;
    }
  }, [user, isLoading, redirectTo]);

  return { user, isLoading };
}
