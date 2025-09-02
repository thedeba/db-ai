'use client';

import { PlusIcon, ChatBubbleLeftIcon, ChevronLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ChatMessage {
  content: string;
  isUser: boolean;
}

interface Chat {
  _id: string;
  title: string;
  timestamp: Date;
  messages: ChatMessage[];
}

interface SidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isCollapsed = false,
  onToggleCollapse = () => {},
}: SidebarProps) {
  return (
    <div className={`relative flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} bg-gray-800 dark:bg-gray-900 text-white h-screen transition-all duration-200`}>
      
      {/* New Chat Button */}
      <div className="flex items-center px-3 py-2">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 p-2 rounded-lg border border-gray-600 dark:border-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors flex-1 text-gray-100 dark:text-gray-200"
        >
          <PlusIcon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">New Chat</span>}
        </button>
      </div>

      {/* Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-12 p-1.5 rounded-full border border-gray-700 bg-gray-900 hover:bg-gray-700 transition-colors"
        style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 py-2 text-sm text-gray-400">Recent chats</div>
        )}
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`flex items-center w-full p-3 hover:bg-gray-700 transition-colors ${ 
              activeChat === chat._id ? 'bg-gray-700' : ''
            }`}
          >
            <button
              onClick={() => onSelectChat(chat._id)}
              className="flex items-center gap-2 flex-1 text-left"
              title={isCollapsed ? chat.title : undefined}
            >
              <ChatBubbleLeftIcon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 truncate">
                  {chat.title || (chat.messages && chat.messages.length > 0 ? chat.messages[0].content.slice(0, 30) + "..." : 'Chat')}
                </div>
              )}
            </button>
            {!isCollapsed && (
              <button
                onClick={() => onDeleteChat(chat._id)}
                className="ml-2 p-1 rounded-md hover:bg-gray-600"
                title="Delete Chat"
              >
                <TrashIcon className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Buttons: Settings & Admin Login */}
      
    </div>
  );
}
