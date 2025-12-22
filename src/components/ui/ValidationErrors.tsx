/**
 * ValidationErrors Component
 *
 * Displays structured validation errors (blocking_issues and warnings) from 422 LEGAL_BLOCK responses.
 * Provides "Go to question" navigation using affected_question_id.
 *
 * UX Rules:
 * - Title: "Fix before generating notice" (not "Required Information Missing")
 * - Sections: "Will block preview" (blocking), "Warnings" (non-blocking)
 * - User-friendly wording with friendly labels
 * - "Why?" expandable section with legal reason
 * - "Go to: [Question Label]" with friendly names
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';

export interface ValidationIssue {
  code: string;
  fields: string[];
  affected_question_id?: string;
  alternate_question_ids?: string[];
  user_fix_hint?: string;
  legal_reason?: string;
  friendlyAction?: string;
  friendlyQuestionLabel?: string;
}

export interface ValidationErrorsProps {
  blocking_issues: ValidationIssue[];
  warnings?: ValidationIssue[];
  caseId: string;
  onRetry?: () => void;
  /** Case type for proper routing */
  caseType?: 'eviction' | 'money_claim' | 'tenancy_agreement';
  /** Jurisdiction for proper routing */
  jurisdiction?: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  /** Product type for proper routing */
  product?: string;
  /** Current selected route (for notice_only) */
  currentRoute?: string;
  /** Alternative routes available when current route is blocked */
  alternativeRoutes?: string[];
  /** Callback when user wants to switch routes */
  onSwitchRoute?: (newRoute: string) => Promise<void>;
}

export function ValidationErrors({
  blocking_issues,
  warnings = [],
  caseId,
  onRetry,
  caseType,
  jurisdiction,
  product,
  currentRoute,
  alternativeRoutes = [],
  onSwitchRoute,
}: ValidationErrorsProps) {
  const router = useRouter();
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [switchingRoute, setSwitchingRoute] = useState(false);

  const toggleExpanded = (issueKey: string) => {
    setExpandedIssues(prev => {
      const next = new Set(prev);
      if (next.has(issueKey)) {
        next.delete(issueKey);
      } else {
        next.add(issueKey);
      }
      return next;
    });
  };

  /**
   * Build a properly scoped URL that preserves case context.
   * This ensures "Go to question" doesn't drop the case and start a new flow.
   */
  const buildWizardUrl = (questionId?: string) => {
    const params = new URLSearchParams();

    // Required params for wizard/flow
    if (caseType) params.set('type', caseType);
    if (jurisdiction) params.set('jurisdiction', jurisdiction);
    if (product) params.set('product', product);

    // Case context - essential for edit mode
    params.set('case_id', caseId);
    params.set('mode', 'edit');

    // Jump to specific question if provided
    if (questionId) {
      params.set('jump_to', questionId);
    }

    return `/wizard/flow?${params.toString()}`;
  };

  const handleGoToQuestion = (questionId: string) => {
    // Navigate to wizard flow with the specific question, preserving case context
    router.push(buildWizardUrl(questionId));
  };

  const handleEditAnswers = () => {
    // Navigate to wizard for editing, preserving case context
    router.push(buildWizardUrl());
  };

  /**
   * Get a user-friendly label for a question ID
   */
  const getQuestionLabel = (issue: ValidationIssue): string => {
    if (issue.friendlyQuestionLabel) {
      return issue.friendlyQuestionLabel;
    }
    if (issue.affected_question_id) {
      // Convert snake_case to Title Case
      return issue.affected_question_id
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    return 'this question';
  };

  /**
   * Get a user-friendly action message
   */
  const getActionMessage = (issue: ValidationIssue): string => {
    if (issue.friendlyAction) {
      return issue.friendlyAction;
    }
    if (issue.user_fix_hint) {
      return issue.user_fix_hint;
    }
    if (issue.fields.length > 0) {
      return `Complete: ${issue.fields.join(', ')}`;
    }
    return 'Complete the required information';
  };

  /**
   * Get user-friendly label for a route
   */
  const getRouteLabel = (route: string): string => {
    const labels: Record<string, string> = {
      section_21: 'Section 21 (No-Fault)',
      section_8: 'Section 8 (Fault-Based)',
      wales_section_173: 'Section 173 (No-Fault)',
      wales_fault_based: 'Fault-Based Notice',
      notice_to_leave: 'Notice to Leave',
    };
    return labels[route] || route.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  /**
   * Handle route switching
   */
  const handleSwitchRoute = async (newRoute: string) => {
    if (!onSwitchRoute) return;

    setSwitchingRoute(true);
    try {
      await onSwitchRoute(newRoute);
    } catch (err) {
      console.error('Failed to switch route:', err);
    } finally {
      setSwitchingRoute(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Blocking Issues */}
      {blocking_issues.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📋</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Fix before generating notice
              </h3>
              <p className="text-sm text-red-800 mb-4">
                These issues need to be resolved before we can generate your documents.
              </p>

              <div className="space-y-3">
                {blocking_issues.map((issue, index) => {
                  const issueKey = `${issue.code}-${index}`;
                  const isExpanded = expandedIssues.has(issueKey);

                  return (
                    <div
                      key={issueKey}
                      className="bg-white border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {getActionMessage(issue)}
                          </p>

                          {issue.legal_reason && (
                            <div className="mt-2">
                              <button
                                onClick={() => toggleExpanded(issueKey)}
                                className="text-xs text-red-600 hover:text-red-800 underline"
                              >
                                {isExpanded ? 'Hide reason' : 'Why?'}
                              </button>
                              {isExpanded && (
                                <p className="text-xs text-red-700 mt-1 pl-2 border-l-2 border-red-200">
                                  {issue.legal_reason}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {issue.affected_question_id && (
                          <Button
                            onClick={() => handleGoToQuestion(issue.affected_question_id!)}
                            variant="primary"
                            size="small"
                          >
                            Go to: {getQuestionLabel(issue)} →
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleEditAnswers}
                  variant="primary"
                  size="medium"
                >
                  Fix all issues
                </Button>
                {onRetry && (
                  <Button onClick={onRetry} variant="secondary" size="medium">
                    Try again
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Switching (when alternatives are available) */}
      {blocking_issues.length > 0 && alternativeRoutes.length > 0 && onSwitchRoute && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
          <div className="flex items-start gap-4">
            <div className="text-2xl">🔄</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Alternative Route Available
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                {currentRoute && (
                  <>
                    Your current route ({getRouteLabel(currentRoute)}) is blocked.{' '}
                  </>
                )}
                You can switch to an alternative notice type that may work for your situation:
              </p>

              <div className="space-y-2">
                {alternativeRoutes.map((route) => (
                  <div
                    key={route}
                    className="bg-white border border-blue-200 rounded-lg p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getRouteLabel(route)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {route === 'section_8' && 'Requires grounds for possession (rent arrears, breach of tenancy, etc.)'}
                        {route === 'section_21' && 'No grounds required, but strict compliance needed'}
                        {route === 'wales_section_173' && 'No grounds required, 6-month notice period'}
                        {route === 'wales_fault_based' && 'Requires grounds under Renting Homes (Wales) Act 2016'}
                        {route === 'notice_to_leave' && 'For Private Residential Tenancies in Scotland'}
                      </p>
                    </div>
                    <Button
                      onClick={() => void handleSwitchRoute(route)}
                      variant="primary"
                      size="medium"
                      disabled={switchingRoute}
                    >
                      {switchingRoute ? 'Switching...' : `Switch to ${getRouteLabel(route).split(' ')[0]}`}
                    </Button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-blue-700 mt-4">
                After switching, we&apos;ll re-validate your case with the new route.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-r-lg">
          <div className="flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Recommendations
              </h3>
              <p className="text-sm text-yellow-800 mb-4">
                Your documents can be generated, but we recommend reviewing these items:
              </p>

              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div
                    key={`${warning.code}-${index}`}
                    className="bg-white border border-yellow-200 rounded p-3 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {getActionMessage(warning)}
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
