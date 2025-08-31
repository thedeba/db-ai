import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email, name, googleId } = await req.json(); // info from Google OAuth

    if (!email || !googleId) {
      return NextResponse.json({ success: false, message: 'Missing Google info' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ googleId });

    if (!existingUser) {
      // Create new user
      const newUser = {
        name,
        email,
        googleId,         // store Google unique ID
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      console.log("Inserting new Google user:", newUser); // ✅ debug log
      await users.insertOne(newUser);

      return NextResponse.json({ success: true, message: 'User created via Google', user: newUser });
    }

    // Update last login
    await users.updateOne({ googleId }, { $set: { lastLogin: new Date() } });

    return NextResponse.json({ success: true, message: 'User logged in via Google', user: existingUser });
  } catch (error) {
    console.error('Google Login API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
