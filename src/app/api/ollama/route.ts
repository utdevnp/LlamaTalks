import { NextResponse } from 'next/server';
import ollama from 'ollama';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model } = body;

    const result = await ollama.chat({ 
      model: model, 
      messages: messages
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ollama API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process the chat request' },
      { status: 500 }
    );
  }
} 