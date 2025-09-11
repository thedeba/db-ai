'use client';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-3 rounded-bl-none">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium"></span>
          <div className="flex space-x-1">
            <div 
              className="w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce" 
              style={{ 
                animationDelay: '0ms',
                animationDuration: '1.2s'
              }}
            ></div>
            <div 
              className="w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce" 
              style={{ 
                animationDelay: '200ms',
                animationDuration: '1.2s'
              }}
            ></div>
            <div 
              className="w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce" 
              style={{ 
                animationDelay: '400ms',
                animationDuration: '1.2s'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
