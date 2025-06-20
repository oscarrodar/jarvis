// src/app/api/chat/route.ts
import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient'; // Import Supabase client
import { Message as OpenAIMessage } from 'openai/resources/chat/completions'; // For type clarity

// Schema definition comment moved to supabaseClient.ts for better organization

// Initialize the OpenAI client
// IMPORTANT: Set the OPENAI_API_KEY environment variable in your .env.local file
// For local development, you can use a .env.local file:
// OPENAI_API_KEY="your-actual-api-key"

const openaiApiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI;

if (!openaiApiKey) {
  console.warn("OPENAI_API_KEY is not set. Using a placeholder. API calls will likely fail.");
  // Provide a default value or handle the absence of the key appropriately for your app's logic
  // Using a placeholder for the SDK to initialize, actual calls will fail without a real key.
  openai = new OpenAI({ apiKey: "YOUR_OPENAI_API_KEY_PLACEHOLDER" });
} else {
  openai = new OpenAI({ apiKey: openaiApiKey });
}

export const runtime = 'edge'; // Optional: Use Next.js Edge Runtime for best performance

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Ensure `messages` is an array of OpenAI compatible message objects
    const requestMessages: OpenAIMessage[] = body.messages;

    if (!requestMessages || !Array.isArray(requestMessages) || requestMessages.length === 0) {
      return NextResponse.json({ error: 'Messages are required in the request body' }, { status: 400 });
    }

    // Extract the last user message to save it
    const lastUserMessage = requestMessages[requestMessages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      try {
        const { error: userMessageError } = await supabase
          .from('messages') // Your Supabase table name
          .insert([{ role: 'user', content: lastUserMessage.content }]); // Adjust columns as per your schema

        if (userMessageError) {
          console.error('Supabase error saving user message:', userMessageError);
          // Decide if this should be a fatal error for the request
        }
      } catch (dbError) {
        console.error('Unexpected error saving user message to DB:', dbError);
      }
    }

    // Ask OpenAI for a streaming chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or your preferred model
      stream: true,
      messages: requestMessages, // Pass through the messages from the client
    });

    // Convert the response into a friendly text-stream
    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response, {
      onCompletion: async (completion: string) => {
        // This callback is called when the stream completes with the full AI response.
        try {
          const { error: aiMessageError } = await supabase
            .from('messages') // Your Supabase table name
            .insert([{ role: 'assistant', content: completion }]); // Adjust columns as per your schema

          if (aiMessageError) {
            console.error('Supabase error saving AI message:', aiMessageError);
          }
        } catch (dbError) {
          console.error('Unexpected error saving AI message to DB:', dbError);
        }
      },
      // Optional: onStart, onToken callbacks can also be used if needed
    });

    // Respond with the stream
    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error('[API CHAT POST ERROR]', error);

    if (error.response) {
      // OpenAI API error
      return NextResponse.json({ error: error.response.data || 'OpenAI API error' }, { status: error.response.status || 500 });
    } else if (error.message && error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json({ error: 'OpenAI API Key not configured correctly.' }, { status: 500 });
    }

    // Generic server error
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message || String(error) }, { status: 500 });
  }
}
