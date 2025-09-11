'use client';

import { useEffect, useState } from 'react';

interface UserRow {
  _id: string;
  name?: string;
  email?: string;
  createdAt?: string | null;
  lastLogin?: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setUsers(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-300 dark:border-gray-700">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-gray-200 dark:border-gray-800">
                <td className="py-2 pr-4">{u.name || '-'}</td>
                <td className="py-2 pr-4">{u.email || '-'}</td>
                <td className="py-2 pr-4">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                <td className="py-2 pr-4">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


