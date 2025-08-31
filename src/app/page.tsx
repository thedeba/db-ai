'use client';

import { useState, useEffect } from 'react';
import Message from '@/components/Chat/Message';
import ChatInput from '@/components/Chat/ChatInput';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { MODELS } from '@/constants/models';



interface ChatMessage {
  content: string;
  isUser: boolean;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: ChatMessage[];
}

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();

  const [selectedModel, setSelectedModel] = useState(MODELS[0]);

  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessages([]);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
    }
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    const userMessage: ChatMessage = { content: message, isUser: true };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Update chat history
    if (activeChat) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: updatedMessages,
                title: message.slice(0, 30) + '...',
              }
            : chat
        )
      );
    }

    try {
      // Replace with your Hugging Face Space API endpoint
      const response = await fetch(selectedModel.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ text: message }),
      });

      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage: ChatMessage = { content: data.response, isUser: false };
      const newMessages = [...updatedMessages, aiMessage];
      setMessages(newMessages);

      // Update chat history
      if (activeChat) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChat
              ? { ...chat, messages: newMessages }
              : chat
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        content: 'Sorry, something went wrong. Please try again.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="bg-gray-800 dark:bg-gray-900">
        <Sidebar
          chats={chats}
          activeChat={activeChat}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Header isDarkMode={isDarkMode} onThemeToggle={toggleTheme} models={MODELS} selectedModel={selectedModel} onSelectModel={setSelectedModel}/>
        
        <main className="flex-1 overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
          <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-[var(--background)] text-[var(--foreground)]">
              {messages.map((message, index) => (
                <Message key={index} {...message} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 rounded-bl-none">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-[var(--background)] text-[var(--foreground)]">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
