'use client';

import { useChat, Message as VercelAIMessage } from 'ai/react';
import React, { useEffect, useRef } from 'react'; // Import useEffect and useRef

// Define a type for the messages expected by useChat, if not directly using VercelAIMessage
export type ChatMessage = VercelAIMessage;

interface ChatClientComponentProps {
  initialMessages: ChatMessage[];
}

export default function ChatClientComponent({ initialMessages }: ChatClientComponentProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: initialMessages,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // More specific loading check for "AI is thinking..."
  // This checks if the last message was from the user and isLoading is true
  const isAiResponding = isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user';


  return (
    // The main UI structure from the original page.tsx
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-2xl h-[calc(100vh-100px)] sm:h-[calc(100vh-150px)] md:h-[calc(100vh-200px)] border border-gray-700 rounded-lg shadow-xl flex flex-col">
        {/* Chat messages area */}
        <div ref={messagesContainerRef} className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto bg-gray-800 rounded-t-lg">
          {messages.length > 0 ? (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : m.role === 'assistant'
                        ? 'bg-gray-600 text-white'
                        : 'bg-yellow-500 text-black' // For other roles like 'system' or 'tool' if they appear
                  }`}
                >
                  <p className="text-sm sm:text-base whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-400">No messages yet. Start chatting or try refreshing if history isn't loading.</p>
            </div>
          )}
          {/* More specific AI loading indicator */}
          {isAiResponding && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow bg-gray-600 text-white">
                {/* Simple "typing" animation */}
                <div className="flex items-center space-x-1">
                  <span className="text-sm sm:text-base">AI is typing</span>
                  <span className="animate-bounce delay-75 text-lg">.</span>
                  <span className="animate-bounce delay-150 text-lg">.</span>
                  <span className="animate-bounce delay-225 text-lg">.</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Element to help scroll to bottom */}
        </div>

        {/* Error display */}
        {error && (
          <div className="p-3 border-t border-red-700 bg-red-900/30 text-red-400 rounded-b-none"> {/* No rounded-b if input is next */}
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error.message}. Ensure API key and Supabase connection are correct. Check server logs for more details.</p>
          </div>
        )}

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className={`p-4 border-t ${error ? 'border-red-700' : 'border-gray-700'} bg-gray-800 rounded-b-lg`}
        >
          <div className="flex space-x-2 sm:space-x-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Send a message..."
              className="flex-1 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-150 disabled:opacity-50"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition duration-150 shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading} // General isLoading disables form
            >
              {/* More specific loading text for button if AI is responding, else generic 'Sending...' or 'Send' */}
              {isAiResponding ? 'Wait...' : (isLoading ? 'Processing...' : 'Send')}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
