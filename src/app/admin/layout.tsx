'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = (pathname || '').startsWith('/admin/login');
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoginPage) {
      (async () => {
        try {
          const { getFirebaseAuth } = await import('@/lib/firebaseClient');
          const auth = getFirebaseAuth();
          const user = auth.currentUser;
          setAdminName(user?.displayName || user?.email || null);
        } catch {
          setAdminName(null);
        }
      })();
    }
  }, [isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="w-full bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="hover:underline">Dashboard</Link>
              <Link href="/admin/settings" className="hover:underline">Model Configuration</Link>
              <Link href="/admin/users" className="hover:underline">Users</Link>
              <Link href="/admin/models/new" className="hover:underline">Create Model</Link>
              <Link href="/admin/chatlogs" className="hover:underline">Chatlogs</Link>
            </div>
            <div className="flex items-center gap-3">
              {adminName && <span className="text-sm opacity-80">{adminName}</span>}
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/admin/session', { method: 'DELETE' });
                  } finally {
                    try {
                      const { getFirebaseAuth } = await import('@/lib/firebaseClient');
                      const { signOut } = await import('firebase/auth');
                      await signOut(getFirebaseAuth());
                    } catch {}
                    window.location.href = '/';
                  }
                }}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}


