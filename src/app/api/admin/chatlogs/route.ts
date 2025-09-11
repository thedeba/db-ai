import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { connectDB } from '@/lib/mongodb';
import ChatLog from '@/app/api/admin/models/ChatLog';

export async function GET(req: NextRequest) {
  try {
    const redirect = await requireAdmin(req);
    if (redirect) return redirect;

    await connectDB();
    const chatLogs = await ChatLog.find({})
      .sort({ createdAt: -1 })
      .limit(100) // Limit to last 100 chats for performance
      .lean();

    return NextResponse.json({ chatLogs });
  } catch (e) {
    console.error('Error fetching chatlogs:', e);
    return NextResponse.json(
      { error: 'Failed to fetch chatlogs' }, 
      { status: 500 }
    );
  }
}


