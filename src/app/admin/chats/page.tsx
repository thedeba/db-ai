'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatLog {
  id: string;
  userId: string;
  userEmail: string;
  modelId: string;
  messages: ChatMessage[];
  createdAt: string;
}

export default function ChatsPage() {
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatLog | null>(null);

  useEffect(() => {
    // TODO: Implement chat logs fetching
  }, []);

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Chat Logs</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Chats</h2>
            </div>
            <div className="border-t border-gray-200">
              {chatLogs.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none ${
                    selectedChat?.id === chat.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{chat.userEmail}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(chat.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {chat.messages.length} messages
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Details */}
        <div className="lg:col-span-2">
          <Card>
            {selectedChat ? (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Chat Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    User: {selectedChat.userEmail}
                  </p>
                  <p className="text-sm text-gray-500">
                    Model: {selectedChat.modelId}
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedChat.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Select a chat to view details
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
