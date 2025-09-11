'use client';

import { useEffect, useState } from 'react';

interface ChatMessage { content: string; isUser: boolean }
interface ChatLog { _id: string; user: string; title: string; messages: ChatMessage[]; createdAt: string }

export default function AdminChatlogsPage() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch('/api/admin/chatlogs', {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (!res.ok) {
          throw new Error(res.status === 401 
            ? 'Unauthorized. Please log in again.' 
            : 'Failed to fetch chat logs'
          );
        }
        
        const data = await res.json();
        if (!data.chatLogs) {
          throw new Error('Invalid response format');
        }
        
        setLogs(data.chatLogs);
      } catch (e) {
        console.error('Error loading chat logs:', e);
        setError(e instanceof Error ? e.message : 'Failed to load chat logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Chat Logs</h1>
      {logs.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No chat logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log._id} className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {log.user} • {new Date(log.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {log.messages.length} messages
                </div>
              </div>
              <div className="font-medium mt-1">{log.title}</div>
              <div className="mt-2 space-y-1.5 text-sm">
                {log.messages.slice(0, 3).map((m, i) => (
                  <div key={i} className="truncate">
                    <span className={`inline-block w-8 opacity-70 ${m.isUser ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                      {m.isUser ? 'User:' : 'AI:'}
                    </span>
                    {m.content}
                  </div>
                ))}
                {log.messages.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 pl-8">
                    + {log.messages.length - 3} more messages
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


