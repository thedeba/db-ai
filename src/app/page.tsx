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



import { useSession } from 'next-auth/react';
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

  if (activeChat) {
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === activeChat
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

    if (activeChat) {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === activeChat ? { ...chat, messages: newMessages } : chat
        )
      );
    }

    // Save chat to MongoDB
    if (session?.user?.email) {
      await fetch("/api/chatlogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: session.user.email, 
          title: newTitle, 
          messages: newMessages 
        }),
      });
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


  useEffect(() => {
    if (status === 'authenticated') {
      const fetchChats = async () => {
        try {
          const response = await fetch('/api/chatlogs');
          const data = await response.json();
          if (data.success) {
            setChats(data.chatLogs);
            if (data.chatLogs.length > 0) {
              setActiveChat(data.chatLogs[0]._id);
              setMessages(data.chatLogs[0].messages);
            }
          }
        } catch (error) {
          console.error('Failed to fetch chats:', error);
        }
      };
      fetchChats();
    }
  }, [status]);

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
          onDeleteChat={handleDeleteChat}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Header isDarkMode={isDarkMode} onThemeToggle={toggleTheme} models={MODELS} selectedModel={selectedModel} onSelectModel={setSelectedModel}/>
        
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
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 rounded-bl-none">
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Chat input */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
