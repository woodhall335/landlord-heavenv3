'use client';

import React, { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { RiSparklingLine, RiChat1Line, RiLoader4Line, RiErrorWarningLine } from 'react-icons/ri';
import type { Jurisdiction } from '@/lib/jurisdiction/types';
import {
  getTenancyAgreementLabel,
  getTenancyAskHeavenPlaceholder,
  type TenancyWizardJurisdiction,
} from '@/lib/tenancy/wizard-copy';

type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement';
type Product = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement' | 'ast_standard' | 'ast_premium';

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

  const tenancyJurisdiction = jurisdiction as TenancyWizardJurisdiction;
  const isTenancyProduct =
    product === 'tenancy_agreement' || product === 'ast_standard' || product === 'ast_premium';
  const productLabel: string =
    product === 'complete_pack'
      ? 'Eviction Pack'
      : product === 'notice_only'
      ? 'Notice Only'
      : product === 'money_claim'
      ? 'Money Claim Pack'
      : getTenancyAgreementLabel(tenancyJurisdiction);
  const questionPlaceholder = isTenancyProduct
    ? getTenancyAskHeavenPlaceholder(tenancyJurisdiction)
    : 'E.g. "What happens after the court issues the claim?"';

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
      className="ask-heaven-panel relative overflow-hidden rounded-[1.5rem] border border-[#e4dcf5] bg-white/95 shadow-[0_18px_55px_rgba(76,29,149,0.09)] backdrop-blur-sm"
      style={{ padding: '16px' }}
    >
      <div className="pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/70" />
      {/* Header */}
      <div className="relative z-10 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-100">
          <RiSparklingLine className="h-5 w-5 text-violet-600" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[#20103f]">Ask Heaven</h3>
          <p className="mt-0.5 text-xs leading-4 text-[#665d7d]">
            Need help with this step? Ask about your {productLabel.toLowerCase()}.
          </p>
        </div>
      </div>

      {/* Q&A helper */}
      <div className="relative z-10 mt-3 border-t border-[#eee8f8] pt-3">
        <div className="hidden">
          <RiChat1Line className="h-3.5 w-3.5 text-violet-600" />
          <span>Ask questions</span>
        </div>
        <p className="sr-only">
          Ask quick questions about this step, the documents we&apos;re generating, or procedure in{' '}
          {jurisdictionLabel}. Answers are general guidance only – not personalised legal advice.
        </p>

        <div className="space-y-2">
          <textarea
            value={qaInput}
            onChange={(e) => setQaInput(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs leading-4 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            placeholder={questionPlaceholder}
          />
          <Button
            type="button"
            variant="primary"
            size="small"
            className="w-full justify-center shadow-sm hover:shadow-md"
            onClick={handleAskQuestion}
            disabled={qaLoading || !qaInput.trim()}
          >
            {qaLoading ? (
              <>
                <RiLoader4Line className="mr-2 h-3.5 w-3.5 animate-spin text-violet-600" />
                Asking Ask Heaven…
              </>
            ) : (
              <>
                <RiChat1Line className="mr-2 h-3.5 w-3.5 text-white" />
                Ask a question
              </>
            )}
          </Button>
        </div>

        {qaError && (
          <div className="mt-2 flex items-start gap-2 rounded-md bg-red-50 px-2.5 py-2">
            <RiErrorWarningLine className="h-3.5 w-3.5 text-violet-600 mt-0.5" />
            <p className="text-[11px] text-red-700">{qaError}</p>
          </div>
        )}

        {qaMessages.length > 0 && (
          <div className="mt-3 max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-violet-100 bg-violet-50/65 px-2.5 py-2">
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
        <details className="mt-3 text-[11px] leading-4 text-[#746b87]">
          <summary className="cursor-pointer font-medium text-[#5b36b3]">About this guidance</summary>
          <p className="mt-1.5">
            Answers are general guidance for {jurisdictionLabel} and are not a substitute for advice from a regulated legal professional.
          </p>
        </details>
      </div>
    </Card>
  );

  return (
    <>
      {/* Desktop / large screens – sticky in the wizard column only */}
      <div className="hidden lg:block">
        {renderPanelContent()}
      </div>

      {/* Mobile / small screens – inline below the wizard content */}
      <div className="mt-6 lg:hidden">
        {renderPanelContent()}
      </div>
    </>
  );
};
