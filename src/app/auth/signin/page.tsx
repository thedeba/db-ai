'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();

  const handleContinueAsGuest = () => {
    // Store guest mode in sessionStorage to persist across page refreshes
    sessionStorage.setItem('guestMode', 'true');
    router.push('/?guest=true');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to AI Chat</h1>
          <p className="text-gray-600 dark:text-gray-300">Choose how you'd like to continue</p>
        </div>
        
        <div className="space-y-4">
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
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
            </div>
          </div>
          
          <button
            onClick={handleContinueAsGuest}
            className="w-full bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Continue without logging in
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Guest mode: Your chats won't be saved
          </p>
        </div>
      </div>
    </div>
  );
}
