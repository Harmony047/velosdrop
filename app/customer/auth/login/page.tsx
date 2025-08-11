'use client';

import GoogleSignInButton from '@/components/customer/GoogleSignInButton';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/customer/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/logo.png"
            alt="VelosDrop"
            width={180}
            height={60}
            className="h-12 w-auto"
          />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-black p-8 shadow-[0_0_30px_rgba(125,34,234,0.2)]">
          <h1 className="mb-2 text-3xl font-bold">Welcome to VelosDrop</h1>
          <p className="mb-8 text-purple-200">
            Sign in with Google to access fast deliveries
          </p>

          {/* Google Sign-In */}
          <GoogleSignInButton>
            <div className="flex items-center justify-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="white"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </div>
          </GoogleSignInButton>

          <p className="mt-4 text-xs text-purple-300">
            VelosDrop uses Google Sign-In for secure, passwordless authentication
          </p>
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-sm text-purple-300">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="font-semibold text-white underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="font-semibold text-white underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
