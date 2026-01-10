'use client';

import React from 'react';
import { RiRefreshLine } from 'react-icons/ri';
import type { Jurisdiction } from '@/lib/jurisdiction/types';

interface ChatHeaderProps {
  jurisdiction: Jurisdiction;
  onJurisdictionChange: (jurisdiction: Jurisdiction) => void;
  onClearChat?: () => void;
  hasMessages?: boolean;
}

export function ChatHeader({
  jurisdiction,
  onJurisdictionChange,
  onClearChat,
  hasMessages = false,
}: ChatHeaderProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 bg-white rounded-t-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
          ☁️
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Ask Heaven</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-500">AI assistant</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
          value={jurisdiction}
          onChange={(e) => onJurisdictionChange(e.target.value as Jurisdiction)}
          aria-label="Select jurisdiction"
        >
          <option value="england">England</option>
          <option value="wales">Wales</option>
          <option value="scotland">Scotland</option>
          <option value="northern-ireland">Northern Ireland</option>
        </select>

        {hasMessages && onClearChat && (
          <button
            type="button"
            onClick={onClearChat}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <RiRefreshLine className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
