import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getFirebaseAdminApp } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const redirect = await requireAdmin(req);
    if (redirect) return redirect;

    const { uid, claims } = await req.json();

    if (!uid || !claims) {
      return NextResponse.json({ error: 'Missing uid or claims' }, { status: 400 });
    }

    // Set custom claims for the user
    const adminApp = getFirebaseAdminApp();
    await adminApp.auth().setCustomUserClaims(uid, claims);

    return NextResponse.json({ 
      success: true, 
      message: 'Custom claims updated successfully' 
    });
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return NextResponse.json({ 
      error: 'Failed to set custom claims',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const redirect = await requireAdmin(req);
    if (redirect) return redirect;

    const uid = req.nextUrl.searchParams.get('uid');
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid parameter' }, { status: 400 });
    }

    // Get the user's claims
    const adminApp = getFirebaseAdminApp();
    const userRecord = await adminApp.auth().getUser(uid);
    const claims = userRecord.customClaims || {};

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error getting custom claims:', error);
    return NextResponse.json({ 
      error: 'Failed to get custom claims',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
