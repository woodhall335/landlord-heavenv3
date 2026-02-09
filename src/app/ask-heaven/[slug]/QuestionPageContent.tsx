/**
 * Question Page Content Component
 *
 * Renders the main answer content with proper structure for SEO.
 * Content is server-rendered for full indexability.
 */

import React from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import type {
  AskHeavenQuestion,
  QualityGateResult,
} from '@/lib/ask-heaven/questions/client';

interface QuestionPageContentProps {
  question: AskHeavenQuestion;
  qualityResult: QualityGateResult;
}

/**
 * Main content component for question pages.
 *
 * Renders:
 * - Answer in markdown format
 * - Placeholder sections for SEO structure
 * - Quality warnings (if not passing gates)
 */
export function QuestionPageContent({
  question,
  qualityResult,
}: QuestionPageContentProps) {
  const markdownComponents = {
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-base font-semibold text-gray-900 mt-4 mb-2">
        {children}
      </h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-1.5">
        {children}
      </h3>
    ),
    h4: ({ children }: { children: React.ReactNode }) => (
      <h4 className="text-sm font-medium text-gray-900 mt-3 mb-1">
        {children}
      </h4>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="text-sm leading-relaxed text-gray-800 mb-2 last:mb-0">
        {children}
      </p>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc pl-5 space-y-1 my-2 text-sm text-gray-800">
        {children}
      </ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal pl-5 space-y-1 my-2 text-sm text-gray-800">
        {children}
      </ol>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-primary/30 bg-primary/5 text-gray-700 italic px-4 py-2 my-3 rounded-r-lg">
        {children}
      </blockquote>
    ),
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => {
      const isExternal = href?.startsWith('http');
      return (
        <a
          href={href}
          className="text-primary underline underline-offset-2 break-words"
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      );
    },
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full text-sm border border-gray-200">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children: React.ReactNode }) => (
      <thead className="bg-gray-50">{children}</thead>
    ),
    tbody: ({ children }: { children: React.ReactNode }) => (
      <tbody className="divide-y divide-gray-200">{children}</tbody>
    ),
    tr: ({ children }: { children: React.ReactNode }) => (
      <tr className="align-top">{children}</tr>
    ),
    th: ({ children }: { children: React.ReactNode }) => (
      <th className="text-left text-xs font-semibold text-gray-700 px-3 py-2 border-r last:border-r-0">
        {children}
      </th>
    ),
    td: ({ children }: { children: React.ReactNode }) => (
      <td className="text-xs text-gray-700 px-3 py-2 border-r last:border-r-0">
        {children}
      </td>
    ),
    pre: ({ children }: { children: React.ReactNode }) => (
      <pre className="bg-gray-900 text-gray-100 text-xs rounded-lg p-3 overflow-x-auto my-3">
        {children}
      </pre>
    ),
    code: ({ children }: { children: React.ReactNode }) => (
      <code className="px-1 py-0.5 rounded bg-gray-200 text-gray-900 text-xs">
        {children}
      </code>
    ),
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Quality Warning Banner (for drafts/review) */}
      {question.status !== 'approved' && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center gap-2 text-amber-800">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">
              This content is pending review and may not be fully accurate.
            </span>
          </div>
        </div>
      )}

      {/* Chat-style Content */}
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 sm:p-6">
          <div className="space-y-6">
            <div className="flex justify-end">
              <div className="max-w-[85%] md:max-w-[70%]">
                <div className="rounded-2xl rounded-br-md px-5 py-3 bg-primary">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
                    {question.question}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="max-w-[85%] md:max-w-[70%]">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src="/favicon.png"
                      alt="Ask Heaven"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="rounded-2xl rounded-tl-md px-5 py-3 bg-gray-100 text-gray-800">
                      <div className="break-words [overflow-wrap:anywhere]">
                        <ReactMarkdown components={markdownComponents}>
                          {question.answer_md}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Word Count Info (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              Debug: {qualityResult.wordCount} words |{' '}
              Status: {question.status} |{' '}
              Indexable: {qualityResult.passed ? 'Yes' : 'No'}
              {qualityResult.failures.length > 0 && (
                <span className="text-red-500">
                  {' '}
                  | Issues: {qualityResult.failures.map((f) => f.gate).join(', ')}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
