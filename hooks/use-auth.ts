import { useSession } from 'next-auth/react';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { useEffect, useState } from 'react';

export function useAuth() {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const { user: supabaseUser, loading: supabaseLoading, signOut } = useSupabaseAuth();
  const [isReady, setIsReady] = useState(false);

  // Sync loading states
  const loading = supabaseLoading || nextAuthStatus === 'loading' || !isReady;

  // Determine if user is authenticated in both systems
  const isAuthenticated = Boolean(nextAuthSession && supabaseUser);

  // Combined user data
  const user = isAuthenticated ? {
    ...nextAuthSession?.user,
    id: supabaseUser?.id,
    // Add any other user data you need from either system
  } : null;

  // Check for session mismatches
  useEffect(() => {
    if (!loading) {
      const hasNextAuth = Boolean(nextAuthSession);
      const hasSupabase = Boolean(supabaseUser);

      // If sessions are out of sync, sign out from both
      if (hasNextAuth !== hasSupabase) {
        console.warn('Session mismatch detected, signing out');
        signOut();
      }

      setIsReady(true);
    }
  }, [nextAuthSession, supabaseUser, loading, signOut]);

  return {
    user,
    loading,
    isAuthenticated,
    signOut,
  };
}
