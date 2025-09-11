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
}

export default function Page() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalChats: 0,
    activeModels: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log('No user found, redirecting to login...');
        router.push('/admin/login');
      } else if (user.email !== 'admin@gmail.com') { // Replace with your admin email
        console.log('User is not an admin');
        auth.signOut().then(() => router.push('/admin/login'));
      } else {
        console.log('Admin authenticated:', user.email);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
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
              <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
              <p className="mt-2 text-3xl font-semibold text-indigo-600">{stats.totalUsers}</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Active Models</h3>
              <p className="mt-2 text-3xl font-semibold text-indigo-600">{stats.activeModels}</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Total Chats</h3>
              <p className="mt-2 text-3xl font-semibold text-indigo-600">{stats.totalChats}</p>
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

            <Link href="/admin/chatlogs">
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
