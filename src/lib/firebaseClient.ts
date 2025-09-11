import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Validate Firebase config
function validateFirebaseConfig() {
  if (!firebaseConfig.apiKey) {
    throw new Error('Missing Firebase configuration: apiKey');
  }
  if (!firebaseConfig.authDomain) {
    throw new Error('Missing Firebase configuration: authDomain');
  }
  if (!firebaseConfig.projectId) {
    throw new Error('Missing Firebase configuration: projectId');
  }
}

export function getFirebaseApp() {
  try {
    validateFirebaseConfig();
    
    if (!getApps().length) {
      console.log('Initializing Firebase app...');
      const app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized successfully');
      return app;
    }
    return getApp();
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

export function getFirebaseAuth() {
  try {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    return auth;
  } catch (error) {
    console.error('Firebase Auth initialization error:', error);
    throw error;
  }
}


