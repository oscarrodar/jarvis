import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is not set. Using placeholder values. ' +
    'Database operations will likely fail. Please set NEXT_PUBLIC_SUPABASE_URL ' +
    'and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
  // Initialize with placeholder values to allow type checking and basic app functionality,
  // but actual Supabase calls will fail or use a dummy client.
  supabase = createClient('YOUR_SUPABASE_URL_PLACEHOLDER', 'YOUR_SUPABASE_ANON_KEY_PLACEHOLDER', {
    // Optional: You can add further configurations here, e.g., for a dummy client
    // auth: {
    //   persistSession: false,
    // },
  });
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase;

/*
Expected 'messages' table schema in Supabase:

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT, -- Optional: To group messages by a chat session
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')), -- OpenAI roles
  content TEXT,
  -- Any other metadata you might want to store, e.g., user_id
  user_id UUID REFERENCES auth.users(id) -- Optional: if you have user authentication
);

-- Enable Row Level Security (RLS) on your table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your auth setup):
-- Allow authenticated users to insert their own messages
CREATE POLICY "Users can insert their own messages"
ON messages
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id); -- Assuming user_id column links to auth.users

-- Allow users to read their own messages (or all messages in a session if using session_id)
CREATE POLICY "Users can read their own messages"
ON messages
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Make sure to run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` in your Supabase SQL editor
-- if you use `uuid_generate_v4()`.
*/
