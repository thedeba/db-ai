'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (username === adminUsername && password === adminPassword) {
      localStorage.setItem('isAdmin', 'true');
      router.push('/admin/dashboard');
    } else {
      alert('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-80"
      >
        <h1 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Admin Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 mb-4 bg-[var(--background)] text-[var(--foreground)]"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 mb-4 bg-[var(--background)] text-[var(--foreground)]"
        />

        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}
