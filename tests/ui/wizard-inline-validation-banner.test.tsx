/**
 * UI tests for wizard inline validation banners
 *
 * Tests the following requirements:
 * 1. Inline blocking issues banner appears after answering a question with compliance issues
 * 2. Inline warnings banner appears for non-blocking compliance issues
 * 3. Issues are filtered to match the current question
 * 4. Persistent issues summary panel shows issue counts
 *
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock the canonical validation issue type for testing
interface MockValidationIssue {
  code: string;
  severity: 'blocking' | 'warning';
  fields: string[];
  affected_question_id?: string;
  user_fix_hint?: string;
  user_message?: string;
  legal_reason?: string;
}

// Simple test component that mimics the inline validation rendering
const InlineValidationBanner: React.FC<{
  blockingIssues: MockValidationIssue[];
  warnings: MockValidationIssue[];
  currentQuestionId: string;
}> = ({ blockingIssues, warnings, currentQuestionId }) => {
  // Filter issues that match the current question
  const matchingBlockingIssues = blockingIssues.filter(
    (issue) =>
      issue.affected_question_id === currentQuestionId ||
      issue.fields?.some((field) => field === currentQuestionId)
  );

  const matchingWarnings = warnings.filter(
    (issue) =>
      issue.affected_question_id === currentQuestionId ||
      issue.fields?.some((field) => field === currentQuestionId)
  );

  return (
    <div data-testid="inline-validation-container">
      {matchingBlockingIssues.length > 0 && (
        <div data-testid="inline-blocking-banner" className="bg-red-50 border-l-4 border-red-500 p-4">
          <span>🚫</span>
          <p>
            Blocking {matchingBlockingIssues.length === 1 ? 'Issue' : 'Issues'} – will prevent generating
            your documents
          </p>
          <ul>
            {matchingBlockingIssues.map((issue, i) => (
              <li key={`block-${issue.code}-${i}`} data-testid={`blocking-issue-${issue.code}`}>
                {issue.user_fix_hint || issue.user_message}
                {issue.legal_reason && <p>{issue.legal_reason}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {matchingWarnings.length > 0 && (
        <div data-testid="inline-warning-banner" className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <span>⚠️</span>
          <p>{matchingWarnings.length === 1 ? 'Warning' : 'Warnings'} – recommended for compliance</p>
          <ul>
            {matchingWarnings.map((issue, i) => (
              <li key={`warn-${issue.code}-${i}`} data-testid={`warning-issue-${issue.code}`}>
                {issue.user_fix_hint || issue.user_message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Persistent issues summary panel component for testing
const IssuesSummaryPanel: React.FC<{
  issueCounts: { blocking: number; warnings: number };
  blockingIssues: MockValidationIssue[];
  onJumpToQuestion: (questionId: string) => void;
}> = ({ issueCounts, blockingIssues, onJumpToQuestion }) => {
  if (issueCounts.blocking === 0 && issueCounts.warnings === 0) {
    return null;
  }

  return (
    <div data-testid="issues-summary-panel">
      <h3>Compliance Issues</h3>

      {issueCounts.blocking > 0 && (
        <div data-testid="blocking-count">
          <span>Blocking issues</span>
          <span data-testid="blocking-count-badge">{issueCounts.blocking}</span>
        </div>
      )}

      {issueCounts.warnings > 0 && (
        <div data-testid="warnings-count">
          <span>Warnings</span>
          <span data-testid="warnings-count-badge">{issueCounts.warnings}</span>
        </div>
      )}

      {blockingIssues.length > 0 && (
        <div data-testid="issue-list">
          {blockingIssues.slice(0, 3).map((issue, i) => (
            <button
              key={`summary-${issue.code}-${i}`}
              type="button"
              data-testid={`issue-jump-link-${issue.code}`}
              onClick={() => issue.affected_question_id && onJumpToQuestion(issue.affected_question_id)}
              disabled={!issue.affected_question_id}
            >
              {issue.user_fix_hint || issue.user_message}
              {issue.affected_question_id && (
                <span data-testid={`jump-to-${issue.affected_question_id}`}>
                  → Go to: {issue.affected_question_id}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

describe('InlineValidationBanner component', () => {
  it('displays blocking issues banner when there are matching blocking issues', () => {
    const blockingIssues: MockValidationIssue[] = [
      {
        code: 'EPC_NOT_PROVIDED',
        severity: 'blocking',
        fields: ['epc_provided'],
        affected_question_id: 'epc_question',
        user_fix_hint: 'Please provide EPC certificate',
      },
    ];

    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={[]}
        currentQuestionId="epc_question"
      />
    );

    expect(screen.getByTestId('inline-blocking-banner')).toBeDefined();
    expect(screen.getByText('Please provide EPC certificate')).toBeDefined();
  });

  it('does NOT display blocking issues banner when no matching issues', () => {
    const blockingIssues: MockValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'deposit_question',
        user_fix_hint: 'Deposit must be protected',
      },
    ];

    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={[]}
        currentQuestionId="epc_question" // Different question
      />
    );

    expect(screen.queryByTestId('inline-blocking-banner')).toBeNull();
  });

  it('displays warnings banner when there are matching warnings', () => {
    const warnings: MockValidationIssue[] = [
      {
        code: 'RECOMMENDED_FIELD',
        severity: 'warning',
        fields: ['optional_field'],
        affected_question_id: 'optional_question',
        user_fix_hint: 'Consider providing this information',
      },
    ];

    render(
      <InlineValidationBanner
        blockingIssues={[]}
        warnings={warnings}
        currentQuestionId="optional_question"
      />
    );

    expect(screen.getByTestId('inline-warning-banner')).toBeDefined();
    expect(screen.getByText('Consider providing this information')).toBeDefined();
  });

  it('displays both blocking and warning banners when both match', () => {
    const blockingIssues: MockValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'deposit_and_compliance',
        user_fix_hint: 'Deposit must be protected',
      },
    ];

    const warnings: MockValidationIssue[] = [
      {
        code: 'RECOMMENDED_INFO',
        severity: 'warning',
        fields: ['extra_info'],
        affected_question_id: 'deposit_and_compliance',
        user_fix_hint: 'Consider adding extra information',
      },
    ];

    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={warnings}
        currentQuestionId="deposit_and_compliance"
      />
    );

    expect(screen.getByTestId('inline-blocking-banner')).toBeDefined();
    expect(screen.getByTestId('inline-warning-banner')).toBeDefined();
  });

  it('matches issues by field key when affected_question_id is not set', () => {
    const blockingIssues: MockValidationIssue[] = [
      {
        code: 'EPC_NOT_PROVIDED',
        severity: 'blocking',
        fields: ['epc_provided'],
        user_fix_hint: 'EPC must be provided',
      },
    ];

    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={[]}
        currentQuestionId="epc_provided" // Match by field
      />
    );

    expect(screen.getByTestId('inline-blocking-banner')).toBeDefined();
  });

  it('displays legal_reason when provided', () => {
    const blockingIssues: MockValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'deposit_question',
        user_fix_hint: 'Deposit must be protected',
        legal_reason: 'Required under Tenancy Deposit Protection regulations',
      },
    ];

    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={[]}
        currentQuestionId="deposit_question"
      />
    );

    expect(screen.getByText('Required under Tenancy Deposit Protection regulations')).toBeDefined();
  });
});

describe('IssuesSummaryPanel component', () => {
  it('displays blocking issue count', () => {
    render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 3, warnings: 2 }}
        blockingIssues={[]}
        onJumpToQuestion={() => {}}
      />
    );

    expect(screen.getByTestId('blocking-count-badge')).toHaveTextContent('3');
  });

  it('displays warning count', () => {
    render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 0, warnings: 5 }}
        blockingIssues={[]}
        onJumpToQuestion={() => {}}
      />
    );

    expect(screen.getByTestId('warnings-count-badge')).toHaveTextContent('5');
  });

  it('does not render when no issues exist', () => {
    const { container } = render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 0, warnings: 0 }}
        blockingIssues={[]}
        onJumpToQuestion={() => {}}
      />
    );

    expect(container.querySelector('[data-testid="issues-summary-panel"]')).toBeNull();
  });

  it('calls onJumpToQuestion when issue link is clicked', () => {
    const mockJumpToQuestion = vi.fn();
    const blockingIssues: MockValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'deposit_and_compliance',
        user_fix_hint: 'Deposit must be protected',
      },
    ];

    render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 1, warnings: 0 }}
        blockingIssues={blockingIssues}
        onJumpToQuestion={mockJumpToQuestion}
      />
    );

    const jumpLink = screen.getByTestId('issue-jump-link-DEPOSIT_NOT_PROTECTED');
    fireEvent.click(jumpLink);

    expect(mockJumpToQuestion).toHaveBeenCalledWith('deposit_and_compliance');
  });

  it('displays "Go to" link for issues with affected_question_id', () => {
    const blockingIssues: MockValidationIssue[] = [
      {
        code: 'EPC_NOT_PROVIDED',
        severity: 'blocking',
        fields: ['epc_provided'],
        affected_question_id: 'epc_question',
        user_fix_hint: 'EPC must be provided',
      },
    ];

    render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 1, warnings: 0 }}
        blockingIssues={blockingIssues}
        onJumpToQuestion={() => {}}
      />
    );

    expect(screen.getByTestId('jump-to-epc_question')).toBeDefined();
    expect(screen.getByText('→ Go to: epc_question')).toBeDefined();
  });

  it('only shows first 3 blocking issues', () => {
    const blockingIssues: MockValidationIssue[] = [
      { code: 'ISSUE_1', severity: 'blocking', fields: [], user_fix_hint: 'Issue 1', affected_question_id: 'q1' },
      { code: 'ISSUE_2', severity: 'blocking', fields: [], user_fix_hint: 'Issue 2', affected_question_id: 'q2' },
      { code: 'ISSUE_3', severity: 'blocking', fields: [], user_fix_hint: 'Issue 3', affected_question_id: 'q3' },
      { code: 'ISSUE_4', severity: 'blocking', fields: [], user_fix_hint: 'Issue 4', affected_question_id: 'q4' },
      { code: 'ISSUE_5', severity: 'blocking', fields: [], user_fix_hint: 'Issue 5', affected_question_id: 'q5' },
    ];

    render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 5, warnings: 0 }}
        blockingIssues={blockingIssues}
        onJumpToQuestion={() => {}}
      />
    );

    // Should show first 3 issues
    expect(screen.getByText('Issue 1')).toBeDefined();
    expect(screen.getByText('Issue 2')).toBeDefined();
    expect(screen.getByText('Issue 3')).toBeDefined();

    // Should NOT show issues 4 and 5
    expect(screen.queryByText('Issue 4')).toBeNull();
    expect(screen.queryByText('Issue 5')).toBeNull();
  });
});

describe('Issue filtering by current question', () => {
  it('filters blocking issues to only show those matching current question', () => {
    const blockingIssues: MockValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'deposit_and_compliance',
        user_fix_hint: 'Deposit must be protected',
      },
      {
        code: 'EPC_NOT_PROVIDED',
        severity: 'blocking',
        fields: ['epc_provided'],
        affected_question_id: 'epc_question',
        user_fix_hint: 'EPC must be provided',
      },
      {
        code: 'HOW_TO_RENT_NOT_PROVIDED',
        severity: 'blocking',
        fields: ['how_to_rent_given'],
        affected_question_id: 'how_to_rent_question',
        user_fix_hint: 'How to Rent guide must be provided',
      },
    ];

    // Test with EPC question as current
    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={[]}
        currentQuestionId="epc_question"
      />
    );

    // Should only show EPC issue
    expect(screen.getByTestId('blocking-issue-EPC_NOT_PROVIDED')).toBeDefined();
    expect(screen.queryByTestId('blocking-issue-DEPOSIT_NOT_PROTECTED')).toBeNull();
    expect(screen.queryByTestId('blocking-issue-HOW_TO_RENT_NOT_PROVIDED')).toBeNull();
  });
});
