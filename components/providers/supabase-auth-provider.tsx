'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@supabase/supabase-js';

type SupabaseAuthState = {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
};

export const SupabaseAuthContext = createContext<SupabaseAuthState>({
  isAuthenticated: false,
  loading: true,
  user: null
});

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const syncAuth = async () => {
      // Clear user if no session
      if (!session?.user?.email || !session?.user?.id) {
        setUser(null);
        return;
      }

      // Only sync if we have a session but no user
      if (!user) {
        try {
          const response = await fetch('/api/auth/supabase-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              userId: session.user.id,
            }),
          });

          const data = await response.json();
          if (!data.error) {
            setUser(data.user);
          }
        } catch (error) {
          console.error('Error syncing Supabase user:', error);
        }
      }
    };

    if (status !== 'loading') {
      syncAuth();
    }
  }, [session, status, user]);

  // Debug loading state
  const isLoading = status === 'loading' || (!!session && !user);
  console.log('Auth State:', {
    status,
    hasSession: !!session,
    hasUser: !!user,
    isLoading
  });

  return (
    <SupabaseAuthContext.Provider 
      value={{ 
        isAuthenticated: !!session && !!user,
        loading: isLoading,
        user
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
