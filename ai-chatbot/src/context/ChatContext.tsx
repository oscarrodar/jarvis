'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define the Message interface
export interface Message {
  id: string; // Using string for IDs, e.g., uuid
  text: string;
  sender: 'user' | 'ai';
  timestamp?: Date; // Optional: for sorting or display
}

// 2. Define the context state interface
interface ChatState {
  messages: Message[];
  currentInput: string;
}

// 3. Define the context value interface (state + updaters)
interface ChatContextValue extends ChatState {
  addMessage: (message: Message) => void;
  setCurrentInput: (input: string) => void; // Corrected: setCurrentInput consistent with useState
}

// 4. Create the React context
// Initial dummy functions and state for context creation
const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// 5. Create the ChatProvider component
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // setCurrentInput is already provided by useState

  const contextValue: ChatContextValue = {
    messages,
    currentInput,
    addMessage,
    setCurrentInput, // Pass down setCurrentInput from useState
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// 6. Create a custom hook useChat
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
