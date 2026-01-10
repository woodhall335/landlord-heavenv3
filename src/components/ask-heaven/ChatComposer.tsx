'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { RiSendPlaneFill } from 'react-icons/ri';

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Ask a question about UK landlord-tenant law...",
}: ChatComposerProps): React.ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 3-4 lines
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && value.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white p-4 md:p-5 rounded-b-2xl">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors resize-none min-h-[48px]"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            aria-label="Type your question"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="hero-btn-primary px-5 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isLoading ? 'Sending...' : 'Send message'}
        >
          <span className="hidden sm:inline">{isLoading ? 'Sending...' : 'Ask'}</span>
          <RiSendPlaneFill className="w-5 h-5" />
        </button>
      </form>
      <p className="mt-3 text-xs text-gray-500 text-center">
        For guidance only — not legal advice.
        <Link href="/terms" className="text-primary hover:underline ml-1">Terms apply</Link>
      </p>
    </div>
  );
}

export default ChatComposer;
