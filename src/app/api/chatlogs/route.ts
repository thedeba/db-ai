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

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Chat ID is required' }, { status: 400 });
    }

    await connectDB();
    const result = await ChatLog.deleteOne({ _id: id, user: session.user.email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Chat not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Chat deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to delete chat' }, { status: 500 });
  }
}

