'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  countWords,
  getIndexabilityStatus,
  validateQualityGates,
} from '@/lib/ask-heaven/questions/client';
import type { AskHeavenQuestion } from '@/lib/ask-heaven/questions/client';

type StatusFilter = 'draft' | 'review' | 'approved';

export default function AskHeavenAdminListPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<StatusFilter>('review');
  const [search, setSearch] = useState('');
  const [questions, setQuestions] = useState<AskHeavenQuestion[]>([]);

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search.trim()) params.set('search', search.trim());

      const response = await fetch(`/api/admin/ask-heaven/questions?${params.toString()}`);
      if (!response.ok) {
        setError('Failed to load Ask Heaven questions');
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      setQuestions(data.questions ?? []);
    } catch (err) {
      console.error(err);
      setError('Failed to load Ask Heaven questions');
    } finally {
      setIsLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    const init = async () => {
      try {
        const checkResponse = await fetch('/api/admin/check-access');
        if (checkResponse.status === 403) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }
        if (!checkResponse.ok) {
          setError('Failed to verify admin access');
          setIsLoading(false);
          return;
        }
        setHasAccess(true);
        await loadQuestions();
      } catch (err) {
        console.error(err);
        setError('Failed to verify admin access');
        setIsLoading(false);
      }
    };
    void init();
  }, [loadQuestions]);

  useEffect(() => {
    if (hasAccess) {
      void loadQuestions();
    }
  }, [hasAccess, status, loadQuestions]);

  const handleApprove = async (slug: string) => {
    const response = await fetch(`/api/admin/ask-heaven/questions/${slug}/approve`, {
      method: 'POST',
    });
    if (response.ok) {
      await loadQuestions();
    } else {
      alert('Unable to approve question.');
    }
  };

  const handleSetCanonical = async (slug: string) => {
    const canonicalSlug = window.prompt('Set canonical slug (leave blank to clear):') ?? '';
    const response = await fetch(`/api/admin/ask-heaven/questions/${slug}/canonical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canonical_slug: canonicalSlug.trim() || null }),
    });
    if (response.ok) {
      await loadQuestions();
    } else {
      alert('Unable to set canonical slug.');
    }
  };

  const tableRows = useMemo(() => {
    return questions.map((question) => {
      const wordCount = countWords(question.answer_md);
      const quality = validateQualityGates(question);
      const indexability = getIndexabilityStatus(question);
      return {
        question,
        wordCount,
        quality,
        indexability,
      };
    });
  }, [questions]);

  if (!hasAccess && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Access denied</h1>
            <p className="text-sm text-gray-600">
              You do not have permission to view Ask Heaven admin tools.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Ask Heaven Editorial</h1>
              <p className="text-sm text-gray-600">
                Review, approve, and manage Ask Heaven questions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search slug or question..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={loadQuestions}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(['draft', 'review', 'approved'] as StatusFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  status === value
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Jurisdictions</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Word Count</th>
                  <th className="px-4 py-3">Indexability</th>
                  <th className="px-4 py-3">Canonical</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                      Loading questions...
                    </td>
                  </tr>
                )}
                {!isLoading && tableRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                      No questions found.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  tableRows.map(({ question, wordCount, indexability, quality }) => (
                    <tr key={question.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{question.slug}</td>
                      <td className="px-4 py-3 text-gray-700">{question.question}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {question.jurisdictions.join(', ')}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{question.primary_topic}</td>
                      <td className="px-4 py-3 text-gray-700">{wordCount}</td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="font-medium">{indexability.label}</div>
                        {quality.failures.length > 0 && (
                          <ul className="mt-1 text-xs text-gray-500 list-disc list-inside">
                            {quality.failures.map((failure) => (
                              <li key={failure.gate}>{failure.reason}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {question.canonical_slug || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/ask-heaven/${question.slug}`}
                            className="text-primary text-xs font-medium"
                          >
                            Preview
                          </Link>
                          <button
                            type="button"
                            className="text-xs font-medium text-gray-700"
                            onClick={() => handleSetCanonical(question.slug)}
                          >
                            Set canonical
                          </button>
                          <Link
                            href={`/dashboard/admin/ask-heaven/${question.slug}`}
                            className="text-xs font-medium text-gray-700"
                          >
                            Edit
                          </Link>
                        </div>
                        <button
                          type="button"
                          disabled={!quality.passed || Boolean(question.canonical_slug)}
                          onClick={() => handleApprove(question.slug)}
                          className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
