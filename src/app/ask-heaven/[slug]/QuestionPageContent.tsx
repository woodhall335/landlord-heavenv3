/**
 * Question Page Content Component
 *
 * Renders the main answer content with proper structure for SEO.
 * Content is server-rendered for full indexability.
 */

import React from 'react';
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
  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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

      {/* Answer Content */}
      <div className="p-6 lg:p-8">
        <div className="prose prose-blue max-w-none">
          <ReactMarkdown>{question.answer_md}</ReactMarkdown>
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
