'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  countWords,
  getIndexabilityStatus,
  hasRequiredDisclaimer,
  validateQualityGates,
} from '@/lib/ask-heaven/questions/client';
import type { AskHeavenQuestion } from '@/lib/ask-heaven/questions/client';

export default function AskHeavenAdminDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [question, setQuestion] = useState<AskHeavenQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/ask-heaven/questions/${slug}`);
        if (!response.ok) {
          setError('Failed to load question');
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        setQuestion(data.question);
      } catch (err) {
        console.error(err);
        setError('Failed to load question');
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) void load();
  }, [slug]);

  const stats = useMemo(() => {
    if (!question) return null;
    const wordCount = countWords(question.answer_md);
    const quality = validateQualityGates(question);
    const indexability = getIndexabilityStatus(question);
    const hasDisclaimer = hasRequiredDisclaimer(question.answer_md);
    return { wordCount, quality, indexability, hasDisclaimer };
  }, [question]);

  const updateField = (field: keyof AskHeavenQuestion, value: any) => {
    if (!question) return;
    setQuestion({ ...question, [field]: value });
  };

  const handleSave = async () => {
    if (!question) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/ask-heaven/questions/${question.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          summary: question.summary,
          answer_md: question.answer_md,
          jurisdictions: question.jurisdictions,
          primary_topic: question.primary_topic,
          related_slugs: question.related_slugs,
        }),
      });
      if (!response.ok) {
        setError('Failed to save changes');
        return;
      }
      const data = await response.json();
      setQuestion(data.question);
    } catch (err) {
      console.error(err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!question) return;
    const response = await fetch(`/api/admin/ask-heaven/questions/${question.slug}/approve`, {
      method: 'POST',
    });
    if (response.ok) {
      const data = await response.json();
      setQuestion(data.question);
    } else {
      alert('Unable to approve question.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-gray-500">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-red-600">{error || 'Question not found.'}</p>
        </div>
      </div>
    );
  }

  const canApprove = stats?.quality.passed && !question.canonical_slug;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Ask Heaven Question</h1>
            <p className="text-sm text-gray-600">{question.slug}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin/ask-heaven"
              className="text-sm text-gray-600"
            >
              Back to list
            </Link>
            <Link href={`/ask-heaven/${question.slug}`} className="text-sm text-primary">
              Preview
            </Link>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="grid gap-4">
            <label className="text-sm font-medium text-gray-700">
              Question
              <input
                type="text"
                value={question.question}
                onChange={(event) => updateField('question', event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Summary
              <textarea
                value={question.summary}
                onChange={(event) => updateField('summary', event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                rows={4}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Answer (Markdown)
              <textarea
                value={question.answer_md}
                onChange={(event) => updateField('answer_md', event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
                rows={18}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Jurisdictions (comma-separated)
              <input
                type="text"
                value={question.jurisdictions.join(', ')}
                onChange={(event) =>
                  updateField(
                    'jurisdictions',
                    event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)
                  )
                }
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Primary topic
              <input
                type="text"
                value={question.primary_topic}
                onChange={(event) => updateField('primary_topic', event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Related slugs (comma-separated)
              <input
                type="text"
                value={question.related_slugs.join(', ')}
                onChange={(event) =>
                  updateField(
                    'related_slugs',
                    event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)
                  )
                }
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={!canApprove}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Approve
            </button>
          </div>
        </div>

        {stats && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Quality summary</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p><strong>Word count:</strong> {stats.wordCount}</p>
                <p><strong>Disclaimer present:</strong> {stats.hasDisclaimer ? 'Yes' : 'No'}</p>
                <p><strong>Status:</strong> {question.status}</p>
                <p><strong>Canonical slug:</strong> {question.canonical_slug || '—'}</p>
              </div>
              <div>
                <p><strong>Indexability:</strong> {stats.indexability.label}</p>
                {stats.indexability.details.length > 0 && (
                  <ul className="mt-1 list-disc list-inside text-xs text-gray-500">
                    {stats.indexability.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {stats.quality.failures.length > 0 && (
              <div className="text-xs text-gray-600">
                <p className="font-semibold text-gray-700">Quality gate issues:</p>
                <ul className="list-disc list-inside">
                  {stats.quality.failures.map((failure) => (
                    <li key={failure.gate}>{failure.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
