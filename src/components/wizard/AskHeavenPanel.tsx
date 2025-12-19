'use client';

import React, { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { Sparkles, MessageCircle, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement';
type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';
type Product = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';

interface AskHeavenPanelProps {
  caseId: string;
  caseType: CaseType;
  jurisdiction: Jurisdiction;
  product: Product;
  currentQuestionId?: string;
  currentQuestionText?: string;
  currentAnswer?: string | null;
  variant?: 'panel' | 'inline';
  onImproveClick?: () => void;
  /**
   * Optional: allows Ask Heaven to push improved wording
   * straight back into the current answer field.
   */
  onApplySuggestion?: (newText: string) => void;
}

interface AskHeavenResult {
  suggested_wording: string;
  missing_information: string[];
  evidence_suggestions: string[];
  consistency_flags?: string[];
}

interface QAMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const AskHeavenPanel: React.FC<AskHeavenPanelProps> = ({
  caseId,
  caseType,
  jurisdiction,
  product,
  currentQuestionId,
  currentQuestionText,
  currentAnswer,
  variant = 'panel',
  onImproveClick,
  onApplySuggestion,
}) => {
  // Writing helper state
  const [writingLoading, setWritingLoading] = useState(false);
  const [writingError, setWritingError] = useState<string | null>(null);
  const [writingResult, setWritingResult] = useState<AskHeavenResult | null>(null);

  // Q&A state
  const [qaInput, setQaInput] = useState('');
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);

  const hasAnswerText = !!(currentAnswer && currentAnswer.trim().length > 0);

  const jurisdictionLabel: string =
    {
      'england-wales': 'England & Wales',
      scotland: 'Scotland',
      'northern-ireland': 'Northern Ireland',
    }[jurisdiction] || 'your area';

  const productLabel: string =
    product === 'complete_pack'
      ? 'Eviction Pack'
      : product === 'notice_only'
      ? 'Notice Only'
      : product === 'money_claim'
      ? 'Money Claim Pack'
      : 'Tenancy Agreement';

  /**
   * Normalise different backend response shapes into a single
   * AskHeavenResult structure.
   */
  const normaliseResult = (data: any): AskHeavenResult | null => {
    if (!data) return null;

    // 1) Advanced Ask Heaven block
    if (data.ask_heaven && typeof data.ask_heaven === 'object') {
      const r = data.ask_heaven;
      if (r.suggested_wording) {
        return {
          suggested_wording: r.suggested_wording,
          missing_information: r.missing_information || [],
          evidence_suggestions: r.evidence_suggestions || [],
          consistency_flags: r.consistency_flags || [],
        };
      }
    }

    // 2) enhanced_answer format
    if (data.enhanced_answer && typeof data.enhanced_answer === 'object') {
      const r = data.enhanced_answer;
      if (r.suggested) {
        return {
          suggested_wording: r.suggested,
          missing_information: r.missing_information || [],
          evidence_suggestions: r.evidence_suggestions || [],
          consistency_flags: r.consistency_flags || [],
        };
      }
    }

    // 3) Flat suggested_wording
    if (data.suggested_wording) {
      return {
        suggested_wording: data.suggested_wording,
        missing_information: data.missing_information || [],
        evidence_suggestions: data.evidence_suggestions || [],
        consistency_flags: data.consistency_flags || [],
      };
    }

    return null;
  };

  /**
   * Writing helper – improve the user’s wording for the current question.
   * This reuses your existing /api/wizard/answer behaviour.
   */
  const handleImprove = async () => {
    if (!caseId || !currentQuestionId || !hasAnswerText) return;

    if (onImproveClick) {
      onImproveClick();
    }

    setWritingLoading(true);
    setWritingError(null);

    try {
      const response = await fetch('/api/wizard/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          question_id: currentQuestionId,
          answer: currentAnswer,
          // Backend can optionally treat this as "preview / enhance only"
          mode: 'enhance_only',
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Ask Heaven could not improve this answer.');
      }

      const normalised = normaliseResult(json);
      if (!normalised) {
        throw new Error('Ask Heaven is not available for this question.');
      }

      setWritingResult(normalised);
    } catch (err: any) {
      console.error('Ask Heaven writing helper error:', err);
      setWritingError(
        err?.message || 'Failed to improve your wording. Please try again in a moment.',
      );
    } finally {
      setWritingLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (writingResult?.suggested_wording && onApplySuggestion) {
      onApplySuggestion(writingResult.suggested_wording);

      // Reset Ask Heaven state after applying so user can reuse for another field
      setWritingResult(null);
      setWritingError(null);
    }
  };

  /**
   * Q&A helper – let the user ask free-form questions about the process.
   *
   * NOTE: This assumes you expose a dedicated Ask Heaven Q&A endpoint.
   * If your backend uses a different route, update the URL below to match.
   */
  const handleAskQuestion = async () => {
    const question = qaInput.trim();
    if (!question) return;

    setQaError(null);
    setQaLoading(true);
    setQaMessages((prev) => [...prev, { role: 'user', text: question }]);
    setQaInput('');

    try {
      const response = await fetch('/api/wizard/ask-heaven', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          case_type: caseType,
          jurisdiction,
          product,
          question,
          current_question_id: currentQuestionId,
          current_question_text: currentQuestionText,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Ask Heaven could not answer that question.');
      }

      const answer: string =
        json.answer ||
        json.explanation ||
        json.message ||
        'I have provided some guidance based on the details of your case so far.';

      setQaMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (err: any) {
      console.error('Ask Heaven Q&A error:', err);
      setQaError(err?.message || 'Sorry, something went wrong. Please try again.');
    } finally {
      setQaLoading(false);
    }
  };

  // If there is literally no current question yet (very early edge case),
  // we still show the panel so the user can ask generic questions.
  const writingDisabledReason = !hasAnswerText
    ? 'Type your answer first, then Ask Heaven can help tidy it up.'
    : !currentQuestionId
    ? 'Once this question has fully loaded, Ask Heaven can improve your wording.'
    : null;

  const renderPanelContent = () => (
    <Card
      padding="none"
      className="ask-heaven-panel shadow-xl border border-primary/20 bg-white/95 backdrop-blur"
      style={{ paddingTop: '48px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px' }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-0.5">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Ask Heaven</h3>
          <p className="text-xs text-gray-500">
            Your AI co-pilot for the {productLabel.toLowerCase()} in {jurisdictionLabel}. Helps
            with wording and next-step questions. It&apos;s guidance only and not a substitute for
            advice from a regulated legal professional.
          </p>
        </div>
      </div>

      {/* Writing helper */}
      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-gray-800">Writing helper</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Ask Heaven can rewrite your answer in clear, court-friendly language and highlight gaps
          or helpful evidence to mention.
        </p>

        <Button
          type="button"
          variant="outline"
          size="small"
          className="w-full justify-center"
          onClick={handleImprove}
          disabled={writingLoading || !hasAnswerText || !currentQuestionId}
        >
          {writingLoading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Improving your wording…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Improve my wording
            </>
          )}
        </Button>

        {writingDisabledReason && (
          <p className="mt-2 text-[11px] text-gray-500">{writingDisabledReason}</p>
        )}

        {writingError && (
          <div className="mt-2 flex items-start gap-2 rounded-md bg-red-50 px-2.5 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5" />
            <p className="text-[11px] text-red-700">{writingError}</p>
          </div>
        )}

        {writingResult && (
          <div className="mt-3 rounded-md border border-blue-100 bg-blue-50/60 p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[11px] font-semibold text-blue-900">
                Suggested wording (you stay in control)
              </span>
            </div>
            <p className="text-xs text-blue-900 whitespace-pre-wrap mb-2">
              {writingResult.suggested_wording}
            </p>

            {(writingResult.missing_information?.length > 0 ||
              writingResult.evidence_suggestions?.length > 0 ||
              (writingResult.consistency_flags?.length ?? 0) > 0) && (
              <div className="space-y-1.5 mb-2">
                {writingResult.missing_information?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-yellow-900">
                      Things you haven&apos;t mentioned yet
                    </p>
                    <ul className="mt-0.5 list-disc list-inside text-[11px] text-yellow-900">
                      {writingResult.missing_information.map((item, idx) => (
                        <li key={`missing-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {writingResult.evidence_suggestions?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-900">
                      Helpful evidence to gather
                    </p>
                    <ul className="mt-0.5 list-disc list-inside text-[11px] text-emerald-900">
                      {writingResult.evidence_suggestions.map((item, idx) => (
                        <li key={`ev-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {writingResult.consistency_flags &&
                  writingResult.consistency_flags.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-red-900">
                        Possible inconsistencies
                      </p>
                      <ul className="mt-0.5 list-disc list-inside text-[11px] text-red-900">
                        {writingResult.consistency_flags.map((item, idx) => (
                          <li key={`flag-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                size="small"
                variant="primary"
                className="flex-1"
                onClick={handleApplySuggestion}
                disabled={!onApplySuggestion}
              >
                Use this wording
              </Button>
              <Button
                type="button"
                size="small"
                variant="ghost"
                className="flex-1"
                onClick={() => setWritingResult(null)}
              >
                Dismiss
              </Button>
            </div>
            {!onApplySuggestion && (
              <p className="mt-1 text-[10px] text-blue-900/80">
                Tip: you can also copy &amp; paste this into the answer box manually.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Q&A helper */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-gray-800">Ask questions</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Ask quick questions about this step, the documents we&apos;re generating, or procedure in{' '}
          {jurisdictionLabel}. Answers are general guidance only – not personalised legal advice.
        </p>

        <div className="space-y-2">
          <textarea
            value={qaInput}
            onChange={(e) => setQaInput(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent"
            placeholder='E.g. “Do I need to attach the tenancy agreement?” or “What happens after the court issues the claim?”'
          />
          <Button
            type="button"
            variant="secondary"
            size="small"
            className="w-full justify-center"
            onClick={handleAskQuestion}
            disabled={qaLoading || !qaInput.trim()}
          >
            {qaLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Asking Ask Heaven…
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-3.5 w-3.5" />
                Ask a question
              </>
            )}
          </Button>
        </div>

        {qaError && (
          <div className="mt-2 flex items-start gap-2 rounded-md bg-red-50 px-2.5 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5" />
            <p className="text-[11px] text-red-700">{qaError}</p>
          </div>
        )}

        {qaMessages.length > 0 && (
          <div className="mt-3 max-h-40 overflow-y-auto rounded-md bg-gray-50 px-2.5 py-2 space-y-1.5">
            {qaMessages.map((m, idx) => (
              <div
                key={idx}
                className={`text-[11px] leading-snug ${
                  m.role === 'user' ? 'text-gray-800' : 'text-gray-700'
                }`}
              >
                <span className="font-semibold mr-1">
                  {m.role === 'user' ? 'You:' : 'Ask Heaven:'}
                </span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <>
      {variant === 'inline' ? (
        <div className="space-y-2 text-right">
          <Button
            type="button"
            size="small"
            variant="ghost"
            className="text-xs font-semibold text-primary hover:text-primary/80"
            onClick={handleImprove}
            disabled={writingLoading || !hasAnswerText || !currentQuestionId}
          >
            {writingLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Improving…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Improve with Ask Heaven
              </>
            )}
          </Button>

          {writingError && (
            <div className="flex items-start justify-end gap-2 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{writingError}</span>
            </div>
          )}

          {writingResult && (
            <div className="rounded-md border border-blue-100 bg-blue-50/60 p-3 text-left">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">
                  Suggested wording
                </span>
              </div>
              <p className="text-xs text-blue-900 whitespace-pre-wrap mb-2">
                {writingResult.suggested_wording}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  size="small"
                  variant="primary"
                  onClick={handleApplySuggestion}
                  disabled={!onApplySuggestion}
                >
                  Use this wording
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant="ghost"
                  onClick={() => setWritingResult(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop / large screens – sticky in the wizard column only */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              {renderPanelContent()}
            </div>
          </div>

          {/* Mobile / small screens – inline below the wizard content */}
          <div className="mt-6 lg:hidden">
            {renderPanelContent()}
          </div>
        </>
      )}
    </>
  );
};
