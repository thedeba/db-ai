import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';

const ALLOWED_ADMIN_EMAILS = ['admin@gmail.com']; // Add your admin email addresses here

export async function POST(req: NextRequest) {
  try {
    // Get the Firebase ID token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    const auth = getFirebaseAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Check if the user's email is in the allowed admin list
    const email = decodedToken.email;
    if (!email || !ALLOWED_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Not authorized. Only admin users can access this area.' },
        { status: 403 }
      );
    }

    // Create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 days
    });

    const response = NextResponse.json({ status: 'success' });
    
    // Set the session cookie
    response.cookies.set('session', sessionCookie, {
      maxAge: 60 * 60 * 24 * 5, // 5 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;

  } catch (e) {
    console.error('Admin session error', e);
    return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'success' });
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

