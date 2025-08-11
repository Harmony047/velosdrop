'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p className="text-white">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {session?.user?.name || 'User'} 👋
      </h1>
      <p className="mb-6">This is your VelosDrop dashboard.</p>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
      >
        Sign Out
      </button>
    </div>
  );
}
