import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await clientPromise;
  const db = client.db('dbai');
  const models = await db.collection('models').find().toArray();
  return NextResponse.json({ models });
}

export async function POST(req: Request) {
  const body = await req.json();
  const client = await clientPromise;
  const db = client.db('dbai');
  const result = await db.collection('models').insertOne(body);
  return NextResponse.json({ model: { _id: result.insertedId, ...body } });
}
