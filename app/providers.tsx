'use client';

import { SessionProvider } from "next-auth/react";
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SupabaseAuthProvider>
        {children}
      </SupabaseAuthProvider>
    </SessionProvider>
  );
}
