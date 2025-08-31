'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to AI Chat</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign in to start chatting</p>
        </div>
        
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <Image
            src="/google.svg"
            alt="Google logo"
            width={20}
            height={20}
            className="dark:invert"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
