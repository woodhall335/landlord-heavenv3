'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { FollowUpChips } from './FollowUpChips';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeScreen } from './WelcomeScreen';
import type { Jurisdiction } from '@/lib/jurisdiction/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  followUpQuestions?: string[];
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  jurisdiction: Jurisdiction;
  onExampleClick: (question: string) => void;
  onFollowUpClick: (question: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  jurisdiction,
  onExampleClick,
  onFollowUpClick,
}: MessageListProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Check if user is near bottom before auto-scrolling
  const checkIsNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    const threshold = 100; // pixels from bottom
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;
    return position >= height - threshold;
  }, []);

  // Track scroll position
  const handleScroll = useCallback(() => {
    isNearBottomRef.current = checkIsNearBottom();
  }, [checkIsNearBottom]);

  // Auto-scroll to bottom when new messages arrive (if user is near bottom)
  useEffect(() => {
    if (isNearBottomRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Show welcome screen if no messages
  if (messages.length === 0 && !isLoading) {
    return (
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white"
      >
        <WelcomeScreen
          jurisdiction={jurisdiction}
          onExampleClick={onExampleClick}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white"
    >
      {messages.map((message, index) => (
        <div key={message.id}>
          <MessageBubble
            role={message.role}
            content={message.content}
            sources={message.sources}
          />
          {/* Show follow-up chips only for the last assistant message */}
          {message.role === 'assistant' &&
            index === messages.length - 1 &&
            message.followUpQuestions &&
            message.followUpQuestions.length > 0 && (
              <div className="max-w-[85%] md:max-w-[75%] mt-2">
                <FollowUpChips
                  questions={message.followUpQuestions}
                  onQuestionClick={onFollowUpClick}
                />
              </div>
            )}
        </div>
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={endRef} />
    </div>
  );
}

export default MessageList;
