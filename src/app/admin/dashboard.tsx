'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  totalChats: number;
  activeModels: number;
  timestamp?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalChats: 0,
    activeModels: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debug state
  const [lastApiResponse, setLastApiResponse] = useState<Record<string, unknown> | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching stats from MongoDB...');
      
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Raw API response:', data);
      setLastApiResponse(data); // Save for debugging
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      // Ensure we have the required fields
      const newStats = {
        totalUsers: Number(data.totalUsers) || 0,
        totalChats: Number(data.totalChats) || 0,
        activeModels: Number(data.activeModels) || 0,
        timestamp: data.timestamp || new Date().toISOString()
      };

      console.log('Updating stats with:', newStats);
      setStats(newStats);
      setError(null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const initializeDashboard = async () => {
      try {
        const auth = getFirebaseAuth();
        console.log('Checking authentication...');
        
        const user = auth.currentUser;
        if (!user) {
          console.log('No user found, redirecting to login...');
          router.push('/admin/login');
          return;
        }

        console.log('User is authenticated:', user.email);
        
        // Get initial stats
        if (mounted) {
          await fetchStats();
          
          // Set up periodic refresh
          intervalId = setInterval(() => {
            if (mounted) {
              fetchStats();
            }
          }, 5000); // Check every 5 seconds
        }
      } catch (error) {
        console.error('Auth error:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Authentication failed');
          router.push('/admin/login');
        }
      }
    };

    // Start the dashboard
    initializeDashboard();

    // Cleanup function
    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    fetchStats();
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Users</h3>
                  {loading ? (
                    <div className="mt-2 h-9 flex items-center">
                      <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ) : (
                    <div>
                      {/* Debug information */}
                      <div className="text-xs text-gray-500 mb-1">
                        Debug: Current stats = {JSON.stringify(stats)}
                        {lastApiResponse && (
                          <div>Last API Response = {JSON.stringify(lastApiResponse)}</div>
                        )}
                      </div>
                      <p className="mt-2 text-3xl font-semibold text-indigo-600 dark:text-indigo-400">
                        {stats.totalUsers.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Registered in MongoDB
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              {!loading && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(stats.timestamp || '').toLocaleTimeString()}
                </div>
              )}
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Active Models</h3>
                  {loading ? (
                    <div className="mt-2 h-9 flex items-center">
                      <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ) : (
                    <div>
                      <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">
                        {stats.activeModels.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Models in use
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {!loading && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(stats.timestamp || '').toLocaleTimeString()}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Chats</h3>
                  {loading ? (
                    <div className="mt-2 h-9 flex items-center">
                      <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ) : (
                    <div>
                      <p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-400">
                        {stats.totalChats.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Total conversations
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              {!loading && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(stats.timestamp || '').toLocaleTimeString()}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/models/new">
              <div className="relative block p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 cursor-pointer">
                <h3 className="text-base font-semibold text-gray-900">Add New Model</h3>
                <p className="mt-1 text-sm text-gray-500">Configure and deploy a new AI model</p>
              </div>
            </Link>
            
            <Link href="/admin/models">
              <div className="relative block p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 cursor-pointer">
                <h3 className="text-base font-semibold text-gray-900">Manage Models</h3>
                <p className="mt-1 text-sm text-gray-500">View and configure existing models</p>
              </div>
            </Link>

            <Link href="/admin/chats">
              <div className="relative block p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 cursor-pointer">
                <h3 className="text-base font-semibold text-gray-900">View Chat Logs</h3>
                <p className="mt-1 text-sm text-gray-500">Monitor user conversations</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
