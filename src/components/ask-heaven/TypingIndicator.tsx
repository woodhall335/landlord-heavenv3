'use client';

import React from 'react';

export function TypingIndicator(): React.ReactElement {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">☁️</span>
          <span className="text-xs font-semibold text-primary">Ask Heaven</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <span className="text-sm text-gray-500">Heaven is thinking...</span>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
