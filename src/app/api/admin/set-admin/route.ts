import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function ensureFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    ensureFirebaseAdmin();
    const auth = getAuth();

    // Set admin claim for the user
    await auth.setCustomUserClaims(uid, { admin: true });

    // Get the updated user to verify
    const user = await auth.getUser(uid);
    console.log('Updated user claims:', user.customClaims);

    return NextResponse.json({ 
      success: true, 
      message: 'Admin privileges granted successfully',
      claims: user.customClaims 
    });
  } catch (error) {
    console.error('Error setting admin claim:', error);
    return NextResponse.json({ 
      error: 'Failed to set admin privileges' 
    }, { status: 500 });
  }
}
