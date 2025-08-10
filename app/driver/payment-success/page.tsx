// app/driver/payment-success/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheckCircle } from 'react-icons/fi';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = searchParams?.get('amount') || '0.00';
  const driverIdParam = searchParams?.get('driverId') || '1';
  const driverId = Number(driverIdParam);

  useEffect(() => {
    // Trigger balance refresh in this tab
    window.dispatchEvent(new Event('payment-success'));

    // Broadcast to other tabs (same origin) so they refresh as well
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('balance-updates');
        bc.postMessage({ driverId, amount: Math.round(parseFloat(amount) * 100) });
        bc.close();
      } catch (err) {
        console.warn('BroadcastChannel post failed', err);
      }
    }

    // Redirect to wallet after 5 seconds
    const timer = setTimeout(() => {
      router.push('/driver/wallet');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, amount, driverId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <FiCheckCircle className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-green-100">Your wallet has been credited</p>
        </div>
        <div className="p-8 text-center">
          <p className="text-lg mb-4 text-gray-700 font-medium">Amount added:</p>
          <div className="text-4xl font-bold text-purple-600 mb-6">
            ${parseFloat(amount).toFixed(2)}
          </div>
          <p className="text-gray-600 mb-8">You'll be redirected to your wallet shortly...</p>
          <button
            onClick={() => router.push('/driver/wallet')}
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all"
          >
            Go to Wallet Now
          </button>
        </div>
      </div>
    </div>
  );
}
