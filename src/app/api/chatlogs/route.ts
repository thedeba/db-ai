import { NextResponse } from 'next/server';
//import connectDB from '@/lib/mongodb';
import ChatLog from '@/app/api/admin/models/ChatLog';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { userId, messages } = await req.json();
    await connectDB();

    const newChat = new ChatLog({ user: userId, messages });
    await newChat.save();

    return NextResponse.json({ success: true, chat: newChat });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to save chat" }, { status: 500 });
  }
}
