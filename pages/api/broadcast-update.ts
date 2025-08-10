'use client';

import { useEffect } from 'react';

export default function BalanceBroadcast() {
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('balance-updates');
      
      channel.addEventListener('message', (event) => {
        // In a real app, you would check if the update is for the current user
        window.dispatchEvent(new Event('payment-success'));
      });

      return () => channel.close();
    }
  }, []);

  return null;
}