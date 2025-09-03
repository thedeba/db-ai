import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full max-w-2xl mx-auto">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 p-4 pr-12 text-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        disabled={isLoading}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
          }
        }}
      />
      <button
        type="submit"
        disabled={isLoading || !message.trim()}
        className="absolute bottom-3 right-3 rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 disabled:bg-blue-300"
      >
        <PaperAirplaneIcon className="h-6 w-6" />
      </button>
    </form>
  );
}
