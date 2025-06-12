'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Minutia</h1>
      <Link href="/auth/signin">Sign In</Link>
      <div className="space-y-4 text-center">
        {session ? (
          <div className="space-y-4">
            <p>Signed in as {session.user?.email}</p>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
          <button
            onClick={() => signIn('google')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Sign In with Google
          </button>
          <button
            onClick={() => signIn('email')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Sign In with Email
          </button>
          </div>
        )}
      </div>
    </div>
  );
}
