'use client';

import React, { useMemo, useState } from 'react';
import { RiLoader4Line, RiSparklingLine } from 'react-icons/ri';

export interface AskHeavenStepDraftTarget {
  id: string;
  questionText: string;
  currentValue?: string | null;
  seedAnswer: string;
  apply: (text: string) => void | Promise<void>;
}

interface AskHeavenStepAutofillProps {
  caseId?: string;
  jurisdiction: string;
  product: string;
  buttonLabel: string;
  helperText: string;
  emptyStateText?: string;
  targets: AskHeavenStepDraftTarget[];
}

export const AskHeavenStepAutofill: React.FC<AskHeavenStepAutofillProps> = ({
  caseId,
  jurisdiction,
  product,
  buttonLabel,
  helperText,
  emptyStateText = 'All written fields in this step already have content.',
  targets,
}) => {
  const [isDrafting, setIsDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftedCount, setDraftedCount] = useState(0);

  const blankTargets = useMemo(
    () =>
      targets.filter(
        (target) => !String(target.currentValue ?? '').trim() && String(target.seedAnswer || '').trim(),
      ),
    [targets],
  );

  const handleDraft = async () => {
    if (blankTargets.length === 0) {
      setDraftedCount(0);
      setError(null);
      return;
    }

    setIsDrafting(true);
    setError(null);
    let applied = 0;

    try {
      for (const target of blankTargets) {
        const response = await fetch('/api/ask-heaven/enhance-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: caseId,
            case_type: 'eviction',
            jurisdiction,
            product,
            question_id: target.id,
            question_text: target.questionText,
            answer: target.seedAnswer,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Ask Heaven could not draft these sections.');
        }

        const suggestion = String(data?.suggested_wording || '').trim();
        if (!suggestion) {
          continue;
        }

        await target.apply(suggestion);
        applied += 1;
      }

      setDraftedCount(applied);
    } catch (draftError: any) {
      setError(draftError?.message || 'Ask Heaven could not draft these sections right now.');
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className="rounded-[1.35rem] border border-[#e7dbff] bg-[#faf7ff] px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#261544]">Ask Heaven drafting</p>
          <p className="text-sm leading-6 text-[#62597c]">
            {blankTargets.length > 0 ? helperText : emptyStateText}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleDraft()}
          disabled={isDrafting || blankTargets.length === 0}
          className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            isDrafting || blankTargets.length === 0
              ? 'cursor-not-allowed bg-[#ece6ff] text-[#8b83a5]'
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_10px_24px_rgba(109,40,217,0.22)] hover:from-violet-700 hover:to-fuchsia-700'
          }`}
        >
          {isDrafting ? (
            <>
              <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
              Drafting...
            </>
          ) : (
            <>
              <RiSparklingLine className="mr-2 h-4 w-4" />
              {buttonLabel}
            </>
          )}
        </button>
      </div>

      {draftedCount > 0 && (
        <p className="mt-3 text-sm text-emerald-700">
          Ask Heaven filled {draftedCount} blank field{draftedCount === 1 ? '' : 's'} in this step.
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
};

export default AskHeavenStepAutofill;
