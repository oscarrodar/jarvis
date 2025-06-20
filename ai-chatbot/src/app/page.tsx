import supabase from '@/lib/supabaseClient'; // Ensure this path is correct
import ChatClientComponent, { ChatMessage } from './ChatClientComponent'; // Import the client component

// Define the structure of messages fetched from Supabase
// This should align with your 'messages' table schema
interface SupabaseMessage {
  id: string; // Or number, if your id is not uuid
  role: string; // 'user', 'ai', 'assistant', 'system', etc.
  content: string;
  created_at: string; // Or Date
  // Add any other fields you select from Supabase
}

async function getInitialMessages(): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages') // Your table name
      .select('id, role, content, created_at') // Select necessary columns
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching messages:', error.message);
      throw error; // Or return empty array / handle as per your app's logic
    }

    if (!data) {
      return [];
    }

    // Transform Supabase messages to the format expected by useChat (VercelAIMessage)
    // VercelAIMessage expects: id: string, content: string, role: 'user' | 'assistant' | 'system' | 'tool' | 'function';
    const transformedMessages: ChatMessage[] = data.map((msg: SupabaseMessage) => ({
      id: String(msg.id), // Ensure id is a string
      content: msg.content || '', // Ensure content is not null
      role: msg.role === 'ai' ? 'assistant' : (msg.role as ChatMessage['role']), // Map 'ai' to 'assistant'
      // created_at can be omitted or added as a custom property if needed by your UI beyond useChat
    }));

    return transformedMessages;

  } catch (error) {
    // Log the error, but return an empty array to allow the page to render
    console.error('Failed to fetch initial messages:', error);
    return [];
  }
}

export default async function ChatPage() {
  const initialMessages = await getInitialMessages();

  return <ChatClientComponent initialMessages={initialMessages} />;
}
