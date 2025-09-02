import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ChatLog from '@/app/api/admin/models/ChatLog';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const chatLogs = await ChatLog.find({ user: session.user.email }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, chatLogs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to fetch chat logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, title, messages } = await req.json();
    await connectDB();

    const newChat = new ChatLog({ user: userId, title, messages });
    await newChat.save();

    return NextResponse.json({ success: true, chat: newChat });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to save chat" }, { status: 500 });
  }
}

