'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Message from '@/components/Chat/Message';
import ChatInput from '@/components/Chat/ChatInput';
import TypingIndicator from '@/components/Chat/TypingIndicator';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { MODELS } from '@/constants/models';



interface ChatMessage {
  content: string;
  isUser: boolean;
}



import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent session={session} status={status} router={router} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
    </Suspense>
  );
}

function HomeContent({
  session,
  status,
  router,
  isDarkMode,
  toggleTheme
}: {
  session: any;
  status: string;
  router: any;
  isDarkMode: boolean;
  toggleTheme: () => void;
}) {
  const searchParams = useSearchParams();

  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestModeChecked, setGuestModeChecked] = useState(false);

  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for auto-scrolling messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleNewChat = () => {
    const newChat: Chat = {
      _id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat._id);
    setMessages([]);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    const chat = chats.find((c) => c._id === chatId);
    if (chat) {
      setMessages(chat.messages);
    }
  };

interface Chat {
  _id: string;
  title: string;
  timestamp: Date;
  messages: ChatMessage[];
}

const handleSendMessage = async (message: string) => {
  const userMessage: ChatMessage = { content: message, isUser: true };
  const updatedMessages = [...messages, userMessage];
  setMessages(updatedMessages);
  setIsLoading(true);

  const newTitle = message.slice(0, 30) + "...";

  // If no active chat, create a new local chat immediately so Sidebar updates
  let currentChatId = activeChat;
  if (!currentChatId) {
    const tempId = `temp-${Date.now()}`;
    const newChat: Chat = {
      _id: tempId,
      title: newTitle || 'New Chat',
      timestamp: new Date(),
      messages: updatedMessages,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(tempId);
    currentChatId = tempId;
  } else {
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === currentChatId
          ? { ...chat, messages: updatedMessages, title: newTitle }
          : chat
      )
    );
  }

  try {
    let aiReply: string;

    if (selectedModel.useAIClient) {
      // Fetch from your API route (streamed GPT-5 response)
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message }),
      });

      // Read the streamed response as text
      aiReply = await response.text();
    } else {
      // Hugging Face Space fetch (unchanged)
      const response = await fetch(selectedModel.endpoint!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });
      const data = await response.json();
      aiReply = data.response;
    }

    const aiMessage: ChatMessage = { content: aiReply, isUser: false };
    const newMessages = [...updatedMessages, aiMessage];
    setMessages(newMessages);

    if (currentChatId) {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === currentChatId ? { ...chat, messages: newMessages, title: newTitle } : chat
        )
      );
    }

    // Save chat to MongoDB only if user is authenticated and not in guest mode
    if (session?.user?.email && !isGuestMode) {
      const resp = await fetch("/api/chatlogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: session.user.email, 
          title: newTitle, 
          messages: newMessages 
        }),
      });
      // If we created a temp chat, replace it with the saved chat (to sync _id)
      if (resp.ok) {
        const data = await resp.json();
        if (data?.success && data?.chat?._id) {
          const savedChat = data.chat as { _id: string; title: string; messages: ChatMessage[]; createdAt?: string };
          setChats((prev) => {
            const hasTemp = prev.some((c) => c._id === currentChatId);
            if (hasTemp) {
              return prev.map((c) =>
                c._id === currentChatId
                  ? {
                      _id: savedChat._id,
                      title: savedChat.title || newTitle,
                      timestamp: savedChat?.createdAt ? new Date(savedChat.createdAt) : new Date(),
                      messages: savedChat.messages || newMessages,
                    }
                  : c
              );
            }
            // If not found (edge case), prepend it
            return [
              {
                _id: savedChat._id,
                title: savedChat.title || newTitle,
                timestamp: savedChat?.createdAt ? new Date(savedChat.createdAt) : new Date(),
                messages: savedChat.messages || newMessages,
              },
              ...prev,
            ];
          });
          setActiveChat(savedChat._id);
        }
      }
    }

  } catch (error) {
    console.error("Error:", error);
    const errorMessage: ChatMessage = {
      content: "Sorry, something went wrong. Please try again.",
      isUser: false,
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};




  const handleDeleteChat = async (chatId: string) => {
  // Only allow deletion for authenticated users (not in guest mode)
  if (isGuestMode) {
    // For guest mode, just remove from local state
    setChats((prev) => prev.filter((chat) => chat._id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
      setMessages([]);
    }
    return;
  }

  try {
    const response = await fetch(`/api/chatlogs?id=${chatId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      if (activeChat === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } else {
      console.error('Failed to delete chat');
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
  }
};


  // Check for guest mode on component mount
  useEffect(() => {
    // Check URL parameter first
    const guestParam = searchParams.get('guest');
    if (guestParam === 'true') {
      setIsGuestMode(true);
      setGuestModeChecked(true);
      // Clean up the URL parameter
      router.replace('/', { scroll: false });
      return;
    }
    
    // Check sessionStorage as fallback
    const guestMode = sessionStorage.getItem('guestMode');
    if (guestMode === 'true') {
      setIsGuestMode(true);
    }
    
    setGuestModeChecked(true);
  }, [searchParams, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      // Clear guest mode and current state when switching to authenticated mode
      setIsGuestMode(false);
      setActiveChat(null);
      setMessages([]);
      
      // Clear guest mode from sessionStorage
      sessionStorage.removeItem('guestMode');
      
      const fetchChats = async () => {
        try {
          const response = await fetch('/api/chatlogs');
          const data = await response.json();
          if (data.success) {
            setChats(data.chatLogs);
            // Don't automatically load the first chat - start with empty state
            // User can click on a chat from sidebar to load it
          }
        } catch (error) {
          console.error('Failed to fetch chats:', error);
        }
      };
      fetchChats();
    }
  }, [status]);

  // Redirect to sign in if not authenticated and not in guest mode
  useEffect(() => {
    if (guestModeChecked && status === 'unauthenticated' && !isGuestMode) {
      router.push('/auth/signin');
    }
  }, [status, router, isGuestMode, guestModeChecked]);

  if (status === 'loading' || !guestModeChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  // Allow access if user is authenticated OR in guest mode
  if (!session && !isGuestMode) {
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
          onDeleteChat={handleDeleteChat}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Header isDarkMode={isDarkMode} onThemeToggle={toggleTheme} models={MODELS} selectedModel={selectedModel} onSelectModel={setSelectedModel} isGuestMode={isGuestMode}/>
        
        <main
          className={`flex-1 overflow-hidden bg-[var(--background)] text-[var(--foreground)] ${
            messages.length === 0 ? "flex items-center justify-center" : ""
          }`}
        >
          {messages.length > 0 ? (
            <div className="flex flex-col h-full">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message, index) => (
                  <Message key={index} {...message} />
                ))}
                {isLoading && <TypingIndicator />}
                {/* Scroll target */}
                <div ref={messagesEndRef} />
              </div>
              {/* Chat input */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4">
              {/* Welcome Message */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">
                  Hey, {session?.user?.name || 'there'}. Ready to dive in?
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Ask me anything and let's start a conversation
                </p>
              </div>
              
              {/* Chat Input */}
              <div className="w-full max-w-3xl">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
