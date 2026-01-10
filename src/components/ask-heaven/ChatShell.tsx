'use client';

import React from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatComposer } from './ChatComposer';
import type { Jurisdiction } from '@/lib/jurisdiction/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  followUpQuestions?: string[];
}

interface ChatShellProps {
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  jurisdiction: Jurisdiction;
  onJurisdictionChange: (jurisdiction: Jurisdiction) => void;
  onClearChat?: () => void;
  onExampleClick: (question: string) => void;
  onFollowUpClick: (question: string) => void;
  /** Slot for NextBestActionCard */
  actionCard?: React.ReactNode;
  /** Error message to display */
  error?: string | null;
}

export function ChatShell({
  messages,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  jurisdiction,
  onJurisdictionChange,
  onClearChat,
  onExampleClick,
  onFollowUpClick,
  actionCard,
  error,
}: ChatShellProps): React.ReactElement {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden h-[70vh] md:h-[65vh] max-h-[700px] min-h-[400px]">
      {/* Header */}
      <ChatHeader
        jurisdiction={jurisdiction}
        onJurisdictionChange={onJurisdictionChange}
        onClearChat={onClearChat}
        hasMessages={messages.length > 0}
      />

      {/* Message List */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        jurisdiction={jurisdiction}
        onExampleClick={onExampleClick}
        onFollowUpClick={onFollowUpClick}
      />

      {/* Next Best Action Card (slot) */}
      {actionCard && (
        <div className="px-4 md:px-6 pb-2 border-t border-gray-50 bg-white">
          {actionCard}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 md:mx-6 mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Composer */}
      <ChatComposer
        value={input}
        onChange={onInputChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

export default ChatShell;
