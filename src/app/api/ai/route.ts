
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = streamText({
      model: 'openai/gpt-5',
      prompt,
    });

    // Correct method for streaming
    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error('AI Gateway Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


