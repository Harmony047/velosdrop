'use client';

import { DriverFormProvider } from '@/app/context/DriverFormContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Skip auth check for these paths (payment flow + registration)
    const excludedPaths = [
      '/driver/registration',
      '/driver/personal',
      '/driver/vehicle',
      '/driver/documents',
      '/driver/topup',
      '/driver/payment-success',
      '/driver/wallet',
      '/driver-login',
   
    ];

    // Check if current path should be excluded from auth check
    const shouldExcludeAuth = excludedPaths.some(path => 
      pathname?.startsWith(path)
    );

    if (shouldExcludeAuth) {
      return;
    }

    // Special cases for payment flow
    const isComingFromPaymentSuccess = 
      typeof window !== 'undefined' && 
      window.document.referrer.includes('/driver/payment-success');

    const paymentIntent = searchParams?.get('payment_intent');

    if (
      (pathname === '/driver/wallet' && isComingFromPaymentSuccess) ||
      (pathname === '/driver/payment-success' && paymentIntent)
    ) {
      return;
    }

    // Normal auth check for other pages
    const isAuthenticated = localStorage.getItem('driver-auth');
    if (!isAuthenticated) {
      // Store intended path for redirect after login
      sessionStorage.setItem('redirect-after-login', pathname || '/driver');
      router.push('/driver-login');
    } else {
      // Clear any redirect storage after successful auth
      sessionStorage.removeItem('redirect-after-login');
    }
  }, [router, pathname, searchParams]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <DriverFormProvider>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        {children}
      </div>
    </DriverFormProvider>
  );
}