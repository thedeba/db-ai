
import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Load generation settings
    let temperature = 0.7;
    let min_p = 0.1;
    try {
      const client = await clientPromise;
      const db = client.db('db-ai');
      const settings = await db.collection('settings').findOne({ key: 'generation' });
      if (settings?.value) {
        if (typeof settings.value.temperature === 'number') temperature = settings.value.temperature;
        if (typeof settings.value.min_p === 'number') min_p = settings.value.min_p;
      }
    } catch {}

    const result = streamText({
      model: 'openai/gpt-5',
      prompt,
      temperature,
      // Note: min_p not supported by this SDK config; stored for future use
    });

    // Correct method for streaming
    return result.toTextStreamResponse();
  } catch (err: unknown) {
    console.error('AI Gateway Error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'An unknown error occurred' }, { status: 500 });
  }
}


