/**
 * Authentication Hook for Supabase
 *
 * Provides authentication state and methods for sign in, sign up, and sign out.
 * Automatically syncs with Supabase Auth and persists sessions.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { displayName?: string; avatarUrl?: string }) => Promise<void>;
}

/**
 * Hook for managing authentication state
 *
 * @example
 * const { user, loading, signIn, signOut } = useAuth()
 *
 * // Sign in
 * await signIn('user@example.com', 'password')
 *
 * // Check if authenticated
 * if (user) {
 *   console.log('Logged in as:', user.email)
 * }
 *
 * // Sign out
 * await signOut()
 */
export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile record
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          password: '', // Password is stored by Supabase Auth
        });
      }

      setSession(data.session);
      setUser(data.user);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (data: { displayName?: string; avatarUrl?: string }) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('users')
        .update({
          display_name: data.displayName,
          avatar_url: data.avatarUrl,
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };
}

/**
 * Hook to check if user is authenticated
 *
 * @example
 * const isAuthenticated = useIsAuthenticated()
 * if (!isAuthenticated) {
 *   router.push('/login')
 * }
 */
export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth();
  return !loading && user !== null;
}

/**
 * Hook to require authentication (redirects if not authenticated)
 *
 * @example
 * const user = useRequireAuth()
 * // Will redirect to /login if not authenticated
 */
export function useRequireAuth(redirectTo = '/login'): User | null {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = redirectTo;
    }
  }, [user, loading, redirectTo]);

  return user;
}
