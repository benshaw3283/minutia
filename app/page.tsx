'use client';


import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import ContentPreferenceForm from '@/components/content-preference-form';

export default function Home() {
  const { data: session } = useSession();


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Minutia</h1>
      <Link href="/auth/signin">Sign In</Link>
      <div className="space-y-4 text-center">
        {session ? (
          <div className="space-y-4">
            <div className="space-y-2 mb-4 text-black p-4 bg-gray-100 rounded text-sm">
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>User ID:</strong> {session.user?.id}</p>
              <p><strong>Session Status:</strong> Active</p>
              <details>
                <summary>Debug Info</summary>
                <pre className="mt-2 p-2 bg-gray-200 rounded overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </details>
            </div>
            
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
            <div>
              <ContentPreferenceForm />
            </div>
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
