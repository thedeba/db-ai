'use client';

import { PlusIcon, ChatBubbleLeftIcon, ChevronLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  return (
    <div className={`relative flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} bg-gray-800 dark:bg-gray-900 text-white h-screen`}>
      
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
            className={`flex items-center w-full p-3 hover:bg-gray-700 transition-colors min-w-0 ${ 
              activeChat === chat._id ? 'bg-gray-700' : ''
            }`}
          >
            <button
              onClick={() => onSelectChat(chat._id)}
              className="flex items-center gap-2 flex-1 min-w-0 text-left"
              title={isCollapsed ? chat.title : undefined}
            >
              <ChatBubbleLeftIcon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0 truncate whitespace-nowrap">
                  {chat.title || (chat.messages && chat.messages.length > 0 ? chat.messages[0].content.slice(0, 30) + "..." : 'Chat')}
                </div>
              )}
            </button>
            {!isCollapsed && (
              <button
                onClick={() => onDeleteChat(chat._id)}
                className="ml-2 p-1 rounded-md hover:bg-gray-600 flex-shrink-0"
                title="Delete Chat"
              >
                <TrashIcon className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Buttons: Admin Login */}
      <div className="p-3 border-t border-gray-700">
        <Link
          href="/admin/login"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors text-gray-100"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            router.push('/admin/login');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {!isCollapsed && "Admin Portal"}
        </Link>
      </div>
    </div>
  );
}
