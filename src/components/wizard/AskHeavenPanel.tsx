'use client';

import React, { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { RiSparklingLine, RiChat1Line, RiLoader4Line, RiErrorWarningLine } from 'react-icons/ri';
import type { Jurisdiction } from '@/lib/jurisdiction/types';

type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement';
type Product = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';

interface AskHeavenPanelProps {
  caseId: string;
  caseType: CaseType;
  jurisdiction: Jurisdiction;
  product: Product;
  currentQuestionId?: string;
  currentQuestionText?: string;
}

interface QAMessage {
  role: 'user' | 'assistant';
  text: string;
}

/**
 * Ask Heaven Panel - Q&A Assistant Sidebar
 *
 * Provides a Q&A interface where users can ask questions about the wizard process,
 * legal procedures, and get general guidance. This panel appears in the sidebar
 * of all wizard flows.
 *
 * Note: Text enhancement is handled by the AskHeavenInlineEnhancer component
 * which appears directly below relevant text input areas.
 */
export const AskHeavenPanel: React.FC<AskHeavenPanelProps> = ({
  caseId,
  caseType,
  jurisdiction,
  product,
  currentQuestionId,
  currentQuestionText,
}) => {
  // Q&A state
  const [qaInput, setQaInput] = useState('');
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);

  const jurisdictionLabel: string =
    {
      england: 'England',
      wales: 'Wales',
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
   * Q&A helper – let the user ask free-form questions about the process.
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

  const renderPanelContent = () => (
    <Card
      padding="none"
      className="ask-heaven-panel shadow-xl border border-primary/20 bg-white/95 backdrop-blur"
      style={{ paddingTop: '48px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px' }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-0.5">
          <RiSparklingLine className="h-5 w-5 text-[#7C3AED]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Ask Heaven</h3>
          <p className="text-xs text-gray-500">
            Your AI co-pilot for the {productLabel.toLowerCase()} in {jurisdictionLabel}. Ask
            questions about the process, documents, or legal procedures. It&apos;s guidance only
            and not a substitute for advice from a regulated legal professional.
          </p>
        </div>
      </div>

      {/* Q&A helper */}
      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 mb-1">
          <RiChat1Line className="h-3.5 w-3.5 text-[#7C3AED]" />
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
            placeholder='E.g. "Do I need to attach the tenancy agreement?" or "What happens after the court issues the claim?"'
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
                <RiLoader4Line className="mr-2 h-3.5 w-3.5 animate-spin text-[#7C3AED]" />
                Asking Ask Heaven…
              </>
            ) : (
              <>
                <RiChat1Line className="mr-2 h-3.5 w-3.5 text-[#7C3AED]" />
                Ask a question
              </>
            )}
          </Button>
        </div>

        {qaError && (
          <div className="mt-2 flex items-start gap-2 rounded-md bg-red-50 px-2.5 py-2">
            <RiErrorWarningLine className="h-3.5 w-3.5 text-[#7C3AED] mt-0.5" />
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
  );
};
