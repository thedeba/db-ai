'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


interface User {
  username: string;
  email: string;
  createdAt?: string;
}

interface ChatLog {
  username?: string;
  message: string;
  timestamp?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [chatlogs, setChatlogs] = useState<ChatLog[]>([]);

  // ✅ Protect route (redirect if not logged in as admin)
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/admin/login');
    }
  }, [router]);

 // ✅ Fetch users & chatlogs from API
useEffect(() => {
  async function fetchData() {
    try {
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      setUsers(usersData);

      const chatRes = await fetch("/api/chatlogs");
      const chatData = await chatRes.json();
      setChatlogs(chatData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }
  fetchData();
}, []);


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Admin Dashboard
      </h1>

      {/* Users Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Users
        </h2>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chatlogs Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Chat Logs
        </h2>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Message</th>
                <th className="px-4 py-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {chatlogs.map((c, idx) => (
                <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{c.username || 'Anonymous'}</td>
                  <td className="px-4 py-2">{c.message}</td>
                  <td className="px-4 py-2">
                    {c.timestamp ? new Date(c.timestamp).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
