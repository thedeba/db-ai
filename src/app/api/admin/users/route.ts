import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('db-ai');
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({}).toArray();

    // Convert _id and createdAt to strings for JSON
    const cleanUsers = users.map(u => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString() : null,
    }));

    return NextResponse.json(cleanUsers); // ✅ fully serializable
  } catch (err) {
    console.error('Fetch Users API Error:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
