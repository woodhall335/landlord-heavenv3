/**
 * Related Questions Component
 *
 * Displays related Q&A links for internal linking.
 * Only shows approved questions.
 */

import React from 'react';
import Link from 'next/link';
import type { AskHeavenQuestionListItem } from '@/lib/ask-heaven/questions/client';
import type { RelatedQuestionsConfig } from '@/lib/ask-heaven/questions/linking';

interface RelatedQuestionsProps {
  questions: AskHeavenQuestionListItem[];
  config: RelatedQuestionsConfig;
}

/**
 * Related questions sidebar component.
 *
 * Shows links to related Q&A pages for internal linking.
 */
export function RelatedQuestions({ questions, config }: RelatedQuestionsProps) {
  if (questions.length === 0) {
    return null;
  }

  // Limit to configured max
  const displayQuestions = questions.slice(0, config.maxQuestions);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <h3 className="font-semibold text-gray-900">{config.heading}</h3>
      </div>

      <ul className="divide-y divide-gray-100">
        {displayQuestions.map((q) => (
          <li key={q.slug}>
            <Link
              href={`/ask-heaven/${q.slug}`}
              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm text-gray-900 font-medium line-clamp-2">
                {q.question}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {/* Topic badge */}
                <span className="text-xs text-gray-500">
                  {formatTopic(q.primary_topic)}
                </span>
                {/* Jurisdiction indicator */}
                {q.jurisdictions.length === 1 &&
                  q.jurisdictions[0] !== 'uk-wide' && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">
                        {formatJurisdiction(q.jurisdictions[0])}
                      </span>
                    </>
                  )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* View all link */}
      <div className="border-t border-gray-100 px-4 py-3">
        <Link
          href="/ask-heaven"
          className="text-sm text-primary hover:text-primary-700 font-medium"
        >
          View all questions →
        </Link>
      </div>
    </div>
  );
}

// Helper functions

function formatJurisdiction(jurisdiction: string): string {
  const map: Record<string, string> = {
    england: 'England',
    wales: 'Wales',
    scotland: 'Scotland',
    'northern-ireland': 'N. Ireland',
    'uk-wide': 'UK',
  };
  return map[jurisdiction] || jurisdiction;
}

function formatTopic(topic: string): string {
  const map: Record<string, string> = {
    eviction: 'Eviction',
    arrears: 'Rent Arrears',
    deposit: 'Deposit',
    tenancy: 'Tenancy',
    compliance: 'Compliance',
    damage_claim: 'Damage Claim',
    notice_periods: 'Notice Periods',
    court_process: 'Court Process',
    tenant_rights: 'Tenant Rights',
    landlord_obligations: 'Landlord Duties',
    other: 'General',
  };
  return map[topic] || topic;
}
