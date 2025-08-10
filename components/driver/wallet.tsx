'use client';

import { FiPlus, FiArrowUpRight } from 'react-icons/fi';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@libsql/client/web';

export default function Wallet() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [driverId] = useState<number>(1); // In a real app, get from auth/session

  const fetchWalletData = async () => {
    try {
      const turso = createClient({
        url: process.env.TURSO_CONNECTION_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      });

      // Fetch balance and transactions in parallel
      const [balanceResult, txResult] = await Promise.all([
        turso.execute({
          sql: 'SELECT balance FROM drivers WHERE id = ?',
          args: [driverId]
        }),
        turso.execute({
          sql: 'SELECT * FROM driver_transactions WHERE driver_id = ? ORDER BY created_at DESC LIMIT 5',
          args: [driverId]
        })
      ]);

      if (balanceResult.rows.length > 0) {
        setBalance(balanceResult.rows[0].balance as number / 100); // Convert cents to dollars
      }

      setTransactions(txResult.rows);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchWalletData();

    // Set up event listeners for real-time updates
    const handlePaymentSuccess = () => {
      console.log('Received payment success event, refreshing data...');
      fetchWalletData();
    };

    // Listen for custom events
    window.addEventListener('payment-success', handlePaymentSuccess);

    // Set up BroadcastChannel for cross-tab communication
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('balance-updates');
      broadcastChannel.addEventListener('message', (event) => {
        if (event.data.driverId === driverId) {
          console.log('Received balance update broadcast, refreshing...');
          fetchWalletData();
        }
      });
    }

    // Set up polling as fallback (every 30 seconds)
    const pollInterval = setInterval(fetchWalletData, 30000);

    // Cleanup function
    return () => {
      window.removeEventListener('payment-success', handlePaymentSuccess);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      clearInterval(pollInterval);
    };
  }, [driverId]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Available Balance</h3>
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
              Live
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">
                {loading ? (
                  <span className="inline-block h-8 w-32 bg-purple-400 rounded animate-pulse"></span>
                ) : (
                  `$${balance.toFixed(2)}`
                )}
              </p>
              <p className="text-purple-200 text-sm mt-1">
                {balance === 0 ? 'Start by adding funds to your wallet' : 'Your current available balance'}
              </p>
            </div>
            <Link
              href="/driver/topup"
              className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-opacity-90 transition flex items-center"
            >
              <FiPlus className="mr-1" />
              Top Up
            </Link>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Payment Methods</h3>
          <div className="space-y-3">
            {/* Mastercard */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-500 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                    <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Mastercard</h4>
                  <p className="text-sm text-gray-500">**** **** **** 4242</p>
                </div>
              </div>
              <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                Manage
              </button>
            </div>

            {/* EcoCash */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-500 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white mr-4">
                  <FiArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">EcoCash</h4>
                  <p className="text-sm text-gray-500">077*****89</p>
                </div>
              </div>
              <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                Manage
              </button>
            </div>

            {/* Add Payment Method */}
            <button className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-purple-600">
              <FiPlus className="mr-2" />
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {tx.amount > 0 ? (
                        <FiArrowUpRight className="w-5 h-5" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {tx.amount > 0 ? 'Top Up' : 'Withdrawal'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-purple-600'}`}>
                      {tx.amount > 0 ? '+' : '-'}${(Math.abs(tx.amount) / 100).toFixed(2)}
                    </p>
                    <p className={`text-xs capitalize ${
                      tx.status === 'completed' ? 'text-green-500' : 
                      tx.status === 'failed' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}