'use client';

import { SessionProvider } from "next-auth/react";
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ErrorBoundary>
          <SupabaseAuthProvider>
            {children}
          </SupabaseAuthProvider>
        </ErrorBoundary>
      </SessionProvider>
    </ErrorBoundary>
  );
}
