/**
 * ValidationErrors Component
 *
 * Displays structured validation errors (blocking_issues and warnings) from 422 LEGAL_BLOCK responses.
 * Provides "Go to question" navigation using affected_question_id.
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';

export interface ValidationIssue {
  code: string;
  fields: string[];
  affected_question_id?: string;
  alternate_question_ids?: string[];
  user_fix_hint?: string;
}

export interface ValidationErrorsProps {
  blocking_issues: ValidationIssue[];
  warnings?: ValidationIssue[];
  caseId: string;
  onRetry?: () => void;
}

export function ValidationErrors({
  blocking_issues,
  warnings = [],
  caseId,
  onRetry,
}: ValidationErrorsProps) {
  const router = useRouter();

  const handleGoToQuestion = (questionId: string) => {
    // Navigate to wizard flow with the specific question
    router.push(`/wizard/flow?case_id=${caseId}&jump_to=${questionId}`);
  };

  const handleEditAnswers = () => {
    // Navigate to wizard for editing
    router.push(`/wizard/flow?case_id=${caseId}&mode=edit`);
  };

  return (
    <div className="space-y-6">
      {/* Blocking Issues */}
      {blocking_issues.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Required Information Missing
              </h3>
              <p className="text-sm text-red-800 mb-4">
                We need some additional information before we can generate your documents.
                Please complete the following:
              </p>

              <div className="space-y-3">
                {blocking_issues.map((issue, index) => (
                  <div
                    key={`${issue.code}-${index}`}
                    className="bg-white border border-red-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {issue.user_fix_hint || `Missing: ${issue.fields.join(', ')}`}
                        </p>

                        {issue.fields.length > 0 && (
                          <p className="text-xs text-gray-600">
                            Fields: {issue.fields.join(', ')}
                          </p>
                        )}
                      </div>

                      {issue.affected_question_id && (
                        <Button
                          onClick={() => handleGoToQuestion(issue.affected_question_id!)}
                          variant="primary"
                          size="small"
                        >
                          Go to question →
                        </Button>
                      )}
                    </div>

                    {issue.alternate_question_ids && issue.alternate_question_ids.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">
                          Also available in:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {issue.alternate_question_ids.map((altId) => (
                            <button
                              key={altId}
                              onClick={() => handleGoToQuestion(altId)}
                              className="text-xs text-blue-700 hover:text-blue-900 underline"
                            >
                              {altId}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleEditAnswers}
                  variant="primary"
                  size="medium"
                >
                  ✏️ Complete Wizard
                </Button>
                {onRetry && (
                  <Button onClick={onRetry} variant="secondary" size="medium">
                    🔄 Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-r-lg">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚡</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Recommended Improvements
              </h3>
              <p className="text-sm text-yellow-800 mb-4">
                Your documents can be generated, but we recommend addressing these items
                for better legal compliance:
              </p>

              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div
                    key={`${warning.code}-${index}`}
                    className="bg-white border border-yellow-200 rounded p-3 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {warning.user_fix_hint || `Warning: ${warning.fields.join(', ')}`}
                      </p>
                    </div>

                    {warning.affected_question_id && (
                      <Button
                        onClick={() => handleGoToQuestion(warning.affected_question_id!)}
                        variant="secondary"
                        size="small"
                      >
                        Review →
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
