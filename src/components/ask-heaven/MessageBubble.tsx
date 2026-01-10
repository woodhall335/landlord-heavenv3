'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { RiFileCopyLine, RiCheckLine, RiBookLine, RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  onCopy?: () => void;
}

export function MessageBubble({
  role,
  content,
  sources,
  onCopy,
}: MessageBubbleProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-br-md px-4 py-3 bg-primary"
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
            {content}
          </p>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-bl-md px-4 py-3 bg-gray-50 border border-gray-100">
        {/* Header with icon and copy button */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">☁️</span>
            <span className="text-xs font-semibold text-primary">Ask Heaven</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            aria-label="Copy response"
            title="Copy response"
          >
            {copied ? (
              <RiCheckLine className="w-4 h-4 text-green-500" />
            ) : (
              <RiFileCopyLine className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Markdown-rendered response */}
        <div className="prose prose-sm prose-gray max-w-none text-gray-700 [&>p]:mb-2 [&>ul]:my-2 [&>ol]:my-2 [&>li]:my-0.5 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:font-bold [&>h2]:font-semibold [&>h3]:font-semibold [&>strong]:text-gray-900 [&>p:last-child]:mb-0">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {/* Sources - collapsible */}
        {sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setSourcesExpanded(!sourcesExpanded)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors w-full"
              aria-expanded={sourcesExpanded}
            >
              <RiBookLine className="w-3.5 h-3.5" />
              <span>Sources ({sources.length})</span>
              {sourcesExpanded ? (
                <RiArrowUpSLine className="w-4 h-4 ml-auto" />
              ) : (
                <RiArrowDownSLine className="w-4 h-4 ml-auto" />
              )}
            </button>

            {sourcesExpanded && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sources.map((source, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-md"
                  >
                    {source}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
