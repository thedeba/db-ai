import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const redirect = requireAdmin(req);
  if (redirect) return redirect;
  const client = await clientPromise;
  const db = client.db('db-ai');
  const models = await db.collection('model_registry').find({}).toArray();
  return NextResponse.json({ models });
}

export async function POST(req: NextRequest) {
  const redirect = requireAdmin(req);
  if (redirect) return redirect;
  const body = await req.json();
  const client = await clientPromise;
  const db = client.db('db-ai');
  const result = await db.collection('model_registry').insertOne({ ...body, createdAt: new Date() });
  return NextResponse.json({ model: { _id: result.insertedId, ...body } });
}


