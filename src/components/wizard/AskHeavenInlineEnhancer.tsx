/**
 * Ask Heaven Inline Enhancer
 *
 * A reusable inline component that provides AI-powered text enhancement for
 * free-text inputs (textareas) across all wizard flows.
 *
 * Supports two API modes:
 * - Mode A (MQS-backed): calls POST /api/wizard/answer with mode: 'enhance_only'
 * - Mode B (generic): calls POST /api/ask-heaven/enhance-answer with context
 *
 * Usage:
 * <AskHeavenInlineEnhancer
 *   caseId="case_123"
 *   questionId="section8_details"
 *   answer={currentText}
 *   onApply={(newText) => setFieldValue(newText)}
 *   questionText="Particulars of claim"
 *   context={{ jurisdiction: 'england', selected_grounds: [...] }}
 *   apiMode="generic"
 * />
 */

'use client';

import React, { useState, useCallback } from 'react';
import { RiSparklingLine, RiLoader4Line, RiCheckboxCircleLine, RiErrorWarningLine } from 'react-icons/ri';

export type ApiMode = 'mqs' | 'generic' | 'auto';

export interface AskHeavenInlineEnhancerProps {
  /** The case ID for MQS mode */
  caseId?: string;
  /** The question/field ID */
  questionId: string;
  /** Current text value to enhance */
  answer: string;
  /** Callback when user applies the suggestion */
  onApply: (newText: string) => void;
  /** Human-readable question text (required for generic mode) */
  questionText?: string;
  /** Additional context for the AI (used in generic mode) */
  context?: Record<string, any>;
  /** API mode: 'mqs' uses /api/wizard/answer, 'generic' uses /api/ask-heaven/enhance-answer */
  apiMode?: ApiMode;
  /** Minimum characters before showing enhance button (default: 20) */
  minChars?: number;
  /** Custom button label */
  buttonLabel?: string;
  /** Custom helper text shown next to button */
  helperText?: string;
  /** Whether to show in a compact style */
  compact?: boolean;
}

interface EnhanceResult {
  suggested_wording: string;
  missing_information?: string[];
  evidence_suggestions?: string[];
  consistency_flags?: string[];
}

/**
 * Normalizes different backend response shapes into a single structure.
 */
function normaliseResult(data: any): EnhanceResult | null {
  if (!data) return null;

  // 1) Advanced Ask Heaven block (ask_heaven.suggested_wording)
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

  // 2) enhanced_answer format (enhanced_answer.suggested)
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
}

export const AskHeavenInlineEnhancer: React.FC<AskHeavenInlineEnhancerProps> = ({
  caseId,
  questionId,
  answer,
  onApply,
  questionText,
  context,
  apiMode = 'auto',
  minChars = 20,
  buttonLabel = 'Enhance with Ask Heaven',
  helperText = 'AI will improve clarity and court-readiness',
  compact = false,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<EnhanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine effective API mode
  const effectiveMode: 'mqs' | 'generic' = (() => {
    if (apiMode === 'mqs') return 'mqs';
    if (apiMode === 'generic') return 'generic';
    // Auto: use MQS if we have caseId and no explicit context/questionText
    if (caseId && !questionText && !context) return 'mqs';
    return 'generic';
  })();

  // Check if we should show the button
  const trimmedAnswer = answer?.trim() || '';
  const shouldShowButton = trimmedAnswer.length >= minChars;

  const handleEnhance = useCallback(async () => {
    if (!shouldShowButton) return;

    setIsEnhancing(true);
    setError(null);

    try {
      let response: Response;

      if (effectiveMode === 'mqs' && caseId) {
        // MQS mode: use /api/wizard/answer with enhance_only
        response = await fetch('/api/wizard/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: caseId,
            question_id: questionId,
            answer: trimmedAnswer,
            mode: 'enhance_only',
          }),
        });
      } else {
        // Generic mode: use /api/ask-heaven/enhance-answer
        response = await fetch('/api/ask-heaven/enhance-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: caseId,
            question_id: questionId,
            question_text: questionText || questionId,
            answer: trimmedAnswer,
            context: context || {},
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance text');
      }

      const normalised = normaliseResult(data);
      if (normalised) {
        setEnhancedResult(normalised);
      } else {
        throw new Error('No suggestion returned from Ask Heaven');
      }
    } catch (err: any) {
      console.error('Ask Heaven enhance error:', err);
      setError(err.message || 'Failed to enhance. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  }, [shouldShowButton, effectiveMode, caseId, questionId, trimmedAnswer, questionText, context]);

  const handleApply = useCallback(() => {
    if (enhancedResult?.suggested_wording) {
      onApply(enhancedResult.suggested_wording);
      setEnhancedResult(null);
      setError(null);
    }
  }, [enhancedResult, onApply]);

  const handleDismiss = useCallback(() => {
    setEnhancedResult(null);
    setError(null);
  }, []);

  // Don't render anything if answer is too short
  if (!shouldShowButton && !enhancedResult && !error) {
    return null;
  }

  return (
    <div className="ask-heaven-inline-enhancer space-y-3">
      {/* Enhance Button */}
      {shouldShowButton && !enhancedResult && (
        <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
          <button
            type="button"
            onClick={handleEnhance}
            disabled={isEnhancing}
            className={`inline-flex items-center font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
              compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
            }`}
          >
            {isEnhancing ? (
              <>
                <RiLoader4Line className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} mr-2 animate-spin`} />
                Enhancing...
              </>
            ) : (
              <>
                <RiSparklingLine className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} mr-2`} />
                {buttonLabel}
              </>
            )}
          </button>
          <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-xs'}`}>
            {helperText}
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <RiErrorWarningLine className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Enhanced Suggestion Card */}
      {enhancedResult && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />
            <span className="text-sm font-semibold text-indigo-900">
              Ask Heaven Suggestion
            </span>
          </div>

          <p className="text-sm text-indigo-900 whitespace-pre-wrap">
            {enhancedResult.suggested_wording}
          </p>

          {/* Additional guidance sections */}
          {(enhancedResult.missing_information?.length ||
            enhancedResult.evidence_suggestions?.length ||
            enhancedResult.consistency_flags?.length) && (
            <div className="space-y-2 pt-2 border-t border-indigo-200">
              {enhancedResult.missing_information && enhancedResult.missing_information.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-yellow-800">
                    Things you haven&apos;t mentioned yet:
                  </p>
                  <ul className="mt-1 list-disc list-inside text-xs text-yellow-800">
                    {enhancedResult.missing_information.map((item, idx) => (
                      <li key={`missing-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {enhancedResult.evidence_suggestions && enhancedResult.evidence_suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-800">
                    Helpful evidence to gather:
                  </p>
                  <ul className="mt-1 list-disc list-inside text-xs text-emerald-800">
                    {enhancedResult.evidence_suggestions.map((item, idx) => (
                      <li key={`evidence-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {enhancedResult.consistency_flags && enhancedResult.consistency_flags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-800">
                    Possible inconsistencies:
                  </p>
                  <ul className="mt-1 list-disc list-inside text-xs text-red-800">
                    {enhancedResult.consistency_flags.map((item, idx) => (
                      <li key={`flag-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Use this wording
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AskHeavenInlineEnhancer;
