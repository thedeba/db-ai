import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { requireAdmin } from '@/lib/adminAuth';

import { NextApiRequest } from 'next';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResponse = await requireAdmin(request);
    if (authResponse) {
      return authResponse;
    }

    const { temperature, min_p, max_tokens } = await request.json();

    // Validate the input
    if (
      typeof temperature !== 'number' ||
      typeof min_p !== 'number' ||
      typeof max_tokens !== 'number' ||
      temperature < 0 ||
      temperature > 2 ||
      min_p < 0 ||
      min_p > 1 ||
      max_tokens < 1
    ) {
      return NextResponse.json(
        { error: 'Invalid configuration parameters' },
        { status: 400 }
      );
    }

    // Update the model configuration in Firestore
    const db = getFirestore();
    await db.collection('models').doc(params.id).update({
      config: {
        temperature,
        min_p,
        max_tokens,
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating model configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update model configuration' },
      { status: 500 }
    );
  }
}