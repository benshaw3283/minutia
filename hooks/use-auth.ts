import { useSession } from 'next-auth/react';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { useEffect, useMemo } from 'react';

export function useAuth() {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();

  // Determine if user is authenticated in both systems
  const isAuthenticated = Boolean(nextAuthSession && supabaseUser);

  // Combined user data
  const user = useMemo(() => {
    if (!isAuthenticated) return null;
    return {
      ...nextAuthSession?.user,
      id: supabaseUser?.id,
    };
  }, [isAuthenticated, nextAuthSession?.user, supabaseUser?.id]);

  // Debug logging
  useEffect(() => {
    console.log('useAuth state:', {
      isAuthenticated,
      loading: supabaseLoading,
      nextAuthStatus,
      hasNextAuth: !!nextAuthSession,
      hasSupabase: !!supabaseUser,
      nextAuthUser: nextAuthSession?.user,
      supabaseUser,
      combinedUser: user
    });
  }, [isAuthenticated, supabaseLoading, nextAuthStatus, nextAuthSession, supabaseUser, user]);

  return {
    user,
    loading: supabaseLoading,
    isAuthenticated,
    nextAuthStatus,
    hasNextAuth: !!nextAuthSession,
    hasSupabase: !!supabaseUser,
    nextAuthUser: nextAuthSession?.user,
    supabaseUser,
    combinedUser: user
  };
}
