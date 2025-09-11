'use client';

import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Check Firebase initialization
  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        console.log('Firebase Auth is initialized');
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      setError('Failed to initialize authentication. Please check your configuration.');
    }
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.error('Firebase Auth is not initialized');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && window.location.pathname === '/admin/login') {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInitialized) {
      setError('Authentication system is not initialized yet. Please try again.');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      const auth = getFirebaseAuth();
      console.log('Attempting login with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('Login successful:', userCredential.user.email);
      
      // Check if the email is in the allowed admin list
      if (userCredential.user.email === 'admin@gmail.com') { // Replace with your admin email
        console.log('Admin access granted');
        router.push('/admin');
      } else {
        throw new Error('Not authorized. Only admin users can access this area.');
      }
    } catch (e: unknown) {
      console.error('Sign in error:', e);
      if (e instanceof Error) {
        if (e.message.includes('auth/wrong-password')) {
          setError('Invalid password. Please try again.');
        } else if (e.message.includes('auth/user-not-found')) {
          setError('No user found with this email address.');
        } else if (e.message.includes('auth/invalid-email')) {
          setError('Invalid email address format.');
        } else {
          setError(e.message);
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

      const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        // Check if the email is in the allowed admin list
        if (result.user.email === 'admin@gmail.com') { // Replace with your admin email
          console.log('Admin access granted');
          router.push('/admin');
        } else {
          throw new Error('Not authorized. Only admin users can access this area.');
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError('Firebase configuration is missing');
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/admin/settings');
      }
    });
    return () => unsub();
  }, [router]);



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Admin Login</h1>
        {error && (
          <div className="mb-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleEmailPasswordLogin} className="space-y-3 mb-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}


