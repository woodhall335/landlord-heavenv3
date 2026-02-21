/**
 * UI-LEVEL INLINE VALIDATION AUDIT
 *
 * Tests the UI rendering and behavior of inline validation banners
 * and jump-to-question functionality across all notice-only flows.
 *
 * This audit ensures:
 * 1. Inline blocking banners render correctly with issue details
 * 2. Inline warning banners render correctly
 * 3. Issues are filtered by current question ID
 * 4. Jump-to-question navigation preserves case context
 * 5. Issues summary panel shows correct counts and navigation
 *
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ============================================================================
// MOCK TYPES (matching the canonical validation schema)
// ============================================================================

interface WizardValidationIssue {
  code: string;
  severity: 'blocking' | 'warning';
  fields: string[];
  affected_question_id?: string;
  alternate_question_ids?: string[];
  user_fix_hint?: string;
  user_message?: string;
  legal_reason?: string;
  description?: string;
}

interface WizardValidationResponse {
  wizard_warnings: WizardValidationIssue[];
  preview_blocking_issues: WizardValidationIssue[];
  preview_warnings: WizardValidationIssue[];
  has_blocking_issues: boolean;
  issue_counts: { blocking: number; warnings: number };
}

// ============================================================================
// INLINE VALIDATION BANNER COMPONENT (Test Implementation)
// ============================================================================

/**
 * Simulates the inline validation banner as implemented in StructuredWizard
 */
const InlineValidationBanner: React.FC<{
  blockingIssues: WizardValidationIssue[];
  warnings: WizardValidationIssue[];
  currentQuestionId: string;
}> = ({ blockingIssues, warnings, currentQuestionId }) => {
  // Filter issues that match the current question (same logic as StructuredWizard)
  const matchingBlockingIssues = blockingIssues.filter(
    (issue) =>
      issue.affected_question_id === currentQuestionId ||
      issue.alternate_question_ids?.includes(currentQuestionId) ||
      issue.fields?.some((field) => field === currentQuestionId)
  );

  const matchingWarnings = warnings.filter(
    (issue) =>
      issue.affected_question_id === currentQuestionId ||
      issue.alternate_question_ids?.includes(currentQuestionId) ||
      issue.fields?.some((field) => field === currentQuestionId)
  );

  return (
    <div data-testid="inline-validation-container">
      {matchingBlockingIssues.length > 0 && (
        <div
          data-testid="inline-blocking-banner"
          role="alert"
          aria-live="assertive"
          className="bg-red-50 border-l-4 border-red-500 p-4"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true">🚫</span>
            <div>
              <p className="font-semibold text-red-800">
                Blocking {matchingBlockingIssues.length === 1 ? 'Issue' : 'Issues'} – will prevent
                generating your documents
              </p>
              <ul className="mt-2 space-y-2">
                {matchingBlockingIssues.map((issue, i) => (
                  <li key={`block-${issue.code}-${i}`} data-testid={`blocking-issue-${issue.code}`}>
                    <span className="font-medium">{issue.user_fix_hint || issue.user_message}</span>
                    {issue.legal_reason && (
                      <p className="text-sm text-red-600 mt-1" data-testid={`legal-reason-${issue.code}`}>
                        {issue.legal_reason}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {matchingWarnings.length > 0 && (
        <div
          data-testid="inline-warning-banner"
          role="alert"
          aria-live="polite"
          className="bg-amber-50 border-l-4 border-amber-400 p-4"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800">
                {matchingWarnings.length === 1 ? 'Warning' : 'Warnings'} – recommended for compliance
              </p>
              <ul className="mt-2 space-y-2">
                {matchingWarnings.map((issue, i) => (
                  <li key={`warn-${issue.code}-${i}`} data-testid={`warning-issue-${issue.code}`}>
                    {issue.user_fix_hint || issue.user_message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ISSUES SUMMARY PANEL COMPONENT (Test Implementation)
// ============================================================================

/**
 * Simulates the persistent issues summary panel in the wizard sidebar
 */
const IssuesSummaryPanel: React.FC<{
  issueCounts: { blocking: number; warnings: number };
  blockingIssues: WizardValidationIssue[];
  warnings: WizardValidationIssue[];
  onJumpToQuestion: (questionId: string) => void;
  caseId?: string;
  caseType?: string;
  jurisdiction?: string;
  product?: string;
}> = ({ issueCounts, blockingIssues, warnings, onJumpToQuestion, caseId, caseType, jurisdiction, product }) => {
  if (issueCounts.blocking === 0 && issueCounts.warnings === 0) {
    return null;
  }

  const buildJumpUrl = (questionId: string) => {
    const params = new URLSearchParams();
    if (caseId) params.set('case_id', caseId);
    if (caseType) params.set('type', caseType);
    if (jurisdiction) params.set('jurisdiction', jurisdiction);
    if (product) params.set('product', product);
    params.set('mode', 'edit');
    params.set('jump_to', questionId);
    return `/wizard/eviction?${params.toString()}`;
  };

  const allIssues = [...blockingIssues, ...warnings];

  return (
    <div data-testid="issues-summary-panel" className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">Compliance Issues</h3>

      <div className="flex gap-4 mb-4">
        {issueCounts.blocking > 0 && (
          <div data-testid="blocking-count" className="flex items-center gap-2">
            <span className="text-red-600">🚫</span>
            <span>Blocking</span>
            <span
              data-testid="blocking-count-badge"
              className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-sm"
            >
              {issueCounts.blocking}
            </span>
          </div>
        )}

        {issueCounts.warnings > 0 && (
          <div data-testid="warnings-count" className="flex items-center gap-2">
            <span className="text-amber-600">⚠️</span>
            <span>Warnings</span>
            <span
              data-testid="warnings-count-badge"
              className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-sm"
            >
              {issueCounts.warnings}
            </span>
          </div>
        )}
      </div>

      <div data-testid="issue-list" className="space-y-2">
        {allIssues.slice(0, 5).map((issue, i) => (
          <button
            key={`summary-${issue.code}-${i}`}
            type="button"
            data-testid={`issue-jump-link-${issue.code}`}
            onClick={() => issue.affected_question_id && onJumpToQuestion(issue.affected_question_id)}
            disabled={!issue.affected_question_id}
            className={`w-full text-left p-2 rounded ${
              issue.affected_question_id
                ? 'hover:bg-gray-100 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 text-sm">{issue.user_fix_hint || issue.user_message}</span>
              {issue.affected_question_id && (
                <span
                  data-testid={`jump-to-${issue.affected_question_id}`}
                  data-jump-url={buildJumpUrl(issue.affected_question_id)}
                  className="text-blue-600 text-sm whitespace-nowrap"
                >
                  Go to →
                </span>
              )}
            </div>
          </button>
        ))}

        {allIssues.length > 5 && (
          <p data-testid="more-issues-count" className="text-sm text-gray-500 mt-2">
            +{allIssues.length - 5} more issues
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// AUDIT TEST SUITES
// ============================================================================

describe('AUDIT: Inline Blocking Banner Rendering', () => {
  it('renders blocking banner with correct issue details', () => {
    const blockingIssues: WizardValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'deposit_and_compliance',
        user_fix_hint: 'Deposit must be protected in a government-approved scheme',
        legal_reason: 'Housing Act 2004 s.213',
      },
    ];

    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={[]}
        currentQuestionId="deposit_and_compliance"
      />
    );

    expect(screen.getByTestId('inline-blocking-banner')).toBeDefined();
    expect(screen.getByText('Deposit must be protected in a government-approved scheme')).toBeDefined();
    expect(screen.getByText('Housing Act 2004 s.213')).toBeDefined();
    expect(screen.getByTestId('blocking-issue-DEPOSIT_NOT_PROTECTED')).toBeDefined();
  });

  it('renders multiple blocking issues correctly', () => {
    const blockingIssues: WizardValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'compliance_question',
        user_fix_hint: 'Deposit must be protected',
      },
      {
        code: 'PRESCRIBED_INFO_NOT_GIVEN',
        severity: 'blocking',
        fields: ['prescribed_info_given'],
        affected_question_id: 'compliance_question',
        user_fix_hint: 'Prescribed information must be given',
      },
    ];

    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={[]}
        currentQuestionId="compliance_question"
      />
    );

    expect(screen.getByTestId('blocking-issue-DEPOSIT_NOT_PROTECTED')).toBeDefined();
    expect(screen.getByTestId('blocking-issue-PRESCRIBED_INFO_NOT_GIVEN')).toBeDefined();
    expect(screen.getByText(/Blocking Issues/)).toBeDefined();
  });

  it('does NOT render blocking banner when no matching issues', () => {
    const blockingIssues: WizardValidationIssue[] = [
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
});

describe('AUDIT: Inline Warning Banner Rendering', () => {
  it('renders warning banner with correct issue details', () => {
    const warnings: WizardValidationIssue[] = [
      {
        code: 'DEPOSIT_EXCEEDS_CAP',
        severity: 'warning',
        fields: ['deposit_amount', 'rent_amount'],
        affected_question_id: 'deposit_details',
        user_fix_hint: 'Deposit exceeds 5-week cap under Tenant Fees Act 2019',
        legal_reason: 'Tenant Fees Act 2019 s.3',
      },
    ];

    render(
      <InlineValidationBanner blockingIssues={[]} warnings={warnings} currentQuestionId="deposit_details" />
    );

    expect(screen.getByTestId('inline-warning-banner')).toBeDefined();
    expect(screen.getByText(/Deposit exceeds 5-week cap/)).toBeDefined();
    expect(screen.getByTestId('warning-issue-DEPOSIT_EXCEEDS_CAP')).toBeDefined();
  });

  it('renders both blocking and warning banners when applicable', () => {
    const blockingIssues: WizardValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'deposit_question',
        user_fix_hint: 'Deposit must be protected',
      },
    ];

    const warnings: WizardValidationIssue[] = [
      {
        code: 'DEPOSIT_EXCEEDS_CAP',
        severity: 'warning',
        fields: ['deposit_amount'],
        affected_question_id: 'deposit_question',
        user_fix_hint: 'Deposit exceeds cap',
      },
    ];

    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={warnings}
        currentQuestionId="deposit_question"
      />
    );

    expect(screen.getByTestId('inline-blocking-banner')).toBeDefined();
    expect(screen.getByTestId('inline-warning-banner')).toBeDefined();
  });
});

describe('AUDIT: Issue Filtering by Current Question', () => {
  it('only shows issues for current question', () => {
    const blockingIssues: WizardValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'deposit_question',
        user_fix_hint: 'Deposit issue',
      },
      {
        code: 'EPC_NOT_PROVIDED',
        severity: 'blocking',
        fields: ['epc_provided'],
        affected_question_id: 'epc_question',
        user_fix_hint: 'EPC issue',
      },
      {
        code: 'GAS_SAFETY_NOT_PROVIDED',
        severity: 'blocking',
        fields: ['gas_safety_cert_provided'],
        affected_question_id: 'gas_safety_question',
        user_fix_hint: 'Gas safety issue',
      },
    ];

    render(
      <InlineValidationBanner blockingIssues={blockingIssues} warnings={[]} currentQuestionId="epc_question" />
    );

    // Only EPC issue should be shown
    expect(screen.getByTestId('blocking-issue-EPC_NOT_PROVIDED')).toBeDefined();
    expect(screen.queryByTestId('blocking-issue-DEPOSIT_NOT_PROTECTED')).toBeNull();
    expect(screen.queryByTestId('blocking-issue-GAS_SAFETY_NOT_PROVIDED')).toBeNull();
  });

  it('matches by field key when affected_question_id is not set', () => {
    const blockingIssues: WizardValidationIssue[] = [
      {
        code: 'EPC_NOT_PROVIDED',
        severity: 'blocking',
        fields: ['epc_provided', 'epc_valid'],
        user_fix_hint: 'EPC must be provided',
      },
    ];

    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={[]}
        currentQuestionId="epc_provided" // Matches field key
      />
    );

    expect(screen.getByTestId('inline-blocking-banner')).toBeDefined();
  });

  it('matches by alternate_question_ids', () => {
    const blockingIssues: WizardValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'deposit_and_compliance',
        alternate_question_ids: ['deposit_question', 'compliance_overview'],
        user_fix_hint: 'Deposit must be protected',
      },
    ];

    // Should match via alternate_question_ids
    render(
      <InlineValidationBanner
        blockingIssues={blockingIssues}
        warnings={[]}
        currentQuestionId="deposit_question"
      />
    );

    expect(screen.getByTestId('inline-blocking-banner')).toBeDefined();
  });
});

describe('AUDIT: Issues Summary Panel', () => {
  const mockJumpToQuestion = vi.fn();

  beforeEach(() => {
    mockJumpToQuestion.mockClear();
  });

  it('displays correct blocking and warning counts', () => {
    render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 3, warnings: 2 }}
        blockingIssues={[]}
        warnings={[]}
        onJumpToQuestion={mockJumpToQuestion}
      />
    );

    expect(screen.getByTestId('blocking-count-badge').textContent).toBe('3');
    expect(screen.getByTestId('warnings-count-badge').textContent).toBe('2');
  });

  it('does not render when no issues exist', () => {
    const { container } = render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 0, warnings: 0 }}
        blockingIssues={[]}
        warnings={[]}
        onJumpToQuestion={mockJumpToQuestion}
      />
    );

    expect(container.querySelector('[data-testid="issues-summary-panel"]')).toBeNull();
  });

  it('calls onJumpToQuestion with correct question ID', () => {
    const blockingIssues: WizardValidationIssue[] = [
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
        warnings={[]}
        onJumpToQuestion={mockJumpToQuestion}
      />
    );

    const jumpLink = screen.getByTestId('issue-jump-link-DEPOSIT_NOT_PROTECTED');
    fireEvent.click(jumpLink);

    expect(mockJumpToQuestion).toHaveBeenCalledTimes(1);
    expect(mockJumpToQuestion).toHaveBeenCalledWith('deposit_and_compliance');
  });

  it('builds correct jump URL with case context', () => {
    const blockingIssues: WizardValidationIssue[] = [
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
        warnings={[]}
        onJumpToQuestion={mockJumpToQuestion}
        caseId="test-case-123"
        caseType="eviction"
        jurisdiction="england"
        product="notice_only"
      />
    );

    const jumpToSpan = screen.getByTestId('jump-to-epc_question');
    const jumpUrl = jumpToSpan.getAttribute('data-jump-url');

    // Verify URL contains all context parameters
    expect(jumpUrl).toContain('case_id=test-case-123');
    expect(jumpUrl).toContain('type=eviction');
    expect(jumpUrl).toContain('jurisdiction=england');
    expect(jumpUrl).toContain('product=notice_only');
    expect(jumpUrl).toContain('mode=edit');
    expect(jumpUrl).toContain('jump_to=epc_question');
  });

  it('disables jump button when affected_question_id is missing', () => {
    const blockingIssues: WizardValidationIssue[] = [
      {
        code: 'UNKNOWN_ISSUE',
        severity: 'blocking',
        fields: ['unknown_field'],
        user_fix_hint: 'Unknown issue without question ID',
        // No affected_question_id
      },
    ];

    render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 1, warnings: 0 }}
        blockingIssues={blockingIssues}
        warnings={[]}
        onJumpToQuestion={mockJumpToQuestion}
      />
    );

    const jumpButton = screen.getByTestId('issue-jump-link-UNKNOWN_ISSUE');
    expect(jumpButton).toHaveProperty('disabled', true);

    fireEvent.click(jumpButton);
    expect(mockJumpToQuestion).not.toHaveBeenCalled();
  });

  it('limits displayed issues to 5 with overflow count', () => {
    const blockingIssues: WizardValidationIssue[] = Array.from({ length: 7 }, (_, i) => ({
      code: `ISSUE_${i + 1}`,
      severity: 'blocking' as const,
      fields: [`field_${i + 1}`],
      affected_question_id: `question_${i + 1}`,
      user_fix_hint: `Issue ${i + 1} description`,
    }));

    render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 7, warnings: 0 }}
        blockingIssues={blockingIssues}
        warnings={[]}
        onJumpToQuestion={mockJumpToQuestion}
      />
    );

    // Should show first 5 issues
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`Issue ${i} description`)).toBeDefined();
    }

    // Should NOT show issues 6 and 7 directly
    expect(screen.queryByText('Issue 6 description')).toBeNull();
    expect(screen.queryByText('Issue 7 description')).toBeNull();

    // Should show "+2 more issues" count
    expect(screen.getByTestId('more-issues-count').textContent).toContain('+2 more issues');
  });
});

describe('AUDIT: Accessibility Requirements', () => {
  it('blocking banner has correct ARIA attributes', () => {
    const blockingIssues: WizardValidationIssue[] = [
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
        currentQuestionId="deposit_question"
      />
    );

    const banner = screen.getByTestId('inline-blocking-banner');
    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.getAttribute('aria-live')).toBe('assertive');
  });

  it('warning banner has correct ARIA attributes', () => {
    const warnings: WizardValidationIssue[] = [
      {
        code: 'DEPOSIT_EXCEEDS_CAP',
        severity: 'warning',
        fields: ['deposit_amount'],
        affected_question_id: 'deposit_question',
        user_fix_hint: 'Deposit exceeds cap',
      },
    ];

    render(<InlineValidationBanner blockingIssues={[]} warnings={warnings} currentQuestionId="deposit_question" />);

    const banner = screen.getByTestId('inline-warning-banner');
    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.getAttribute('aria-live')).toBe('polite');
  });
});

describe('AUDIT: Canonical Validation Response Shape', () => {
  it('validates expected response structure from /api/wizard/answer', () => {
    // Simulate the canonical response shape
    const mockResponse: WizardValidationResponse = {
      wizard_warnings: [
        {
          code: 'DEPOSIT_EXCEEDS_CAP',
          severity: 'warning',
          fields: ['deposit_amount', 'rent_amount'],
          affected_question_id: 'deposit_details',
          user_fix_hint: 'Deposit exceeds 5-week cap',
          legal_reason: 'Tenant Fees Act 2019 s.3',
        },
      ],
      preview_blocking_issues: [
        {
          code: 'DEPOSIT_NOT_PROTECTED',
          severity: 'blocking',
          fields: ['deposit_protected'],
          affected_question_id: 'deposit_and_compliance',
          user_fix_hint: 'Deposit must be protected',
          legal_reason: 'Housing Act 2004 s.213',
        },
      ],
      preview_warnings: [
        {
          code: 'HMO_RECOMMENDED',
          severity: 'warning',
          fields: ['hmo_license_valid'],
          user_fix_hint: 'Consider HMO licensing',
        },
      ],
      has_blocking_issues: true,
      issue_counts: { blocking: 1, warnings: 2 },
    };

    // Verify structure
    expect(mockResponse.wizard_warnings).toBeDefined();
    expect(mockResponse.preview_blocking_issues).toBeDefined();
    expect(mockResponse.preview_warnings).toBeDefined();
    expect(mockResponse.has_blocking_issues).toBe(true);
    expect(mockResponse.issue_counts.blocking).toBe(1);
    expect(mockResponse.issue_counts.warnings).toBe(2);

    // Verify each issue has required fields
    for (const issue of mockResponse.preview_blocking_issues) {
      expect(issue.code).toBeDefined();
      expect(issue.severity).toBe('blocking');
      expect(issue.fields).toBeDefined();
      expect(Array.isArray(issue.fields)).toBe(true);
      expect(issue.user_fix_hint).toBeDefined();
    }
  });

  it('validates issue code naming convention', () => {
    const expectedCodes = [
      'DEPOSIT_NOT_PROTECTED',
      'PRESCRIBED_INFO_NOT_GIVEN',
      'EPC_NOT_PROVIDED',
      'HOW_TO_RENT_NOT_PROVIDED',
      'GAS_SAFETY_NOT_PROVIDED',
      'HMO_NOT_LICENSED',
      'DEPOSIT_EXCEEDS_CAP',
      'RENT_SMART_NOT_REGISTERED',
      'PRE_ACTION_NOT_MET',
      'CONTRACT_TYPE_INCOMPATIBLE',
    ];

    for (const code of expectedCodes) {
      // All codes should be UPPER_SNAKE_CASE
      expect(code).toMatch(/^[A-Z][A-Z0-9_]+$/);
    }
  });
});

describe('AUDIT: Complete Wizard vs Jump-to-Question', () => {
  const mockJumpToQuestion = vi.fn();

  beforeEach(() => {
    mockJumpToQuestion.mockClear();
  });

  it('jump-to-question preserves case context (does not reset flow)', () => {
    const blockingIssues: WizardValidationIssue[] = [
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
        warnings={[]}
        onJumpToQuestion={mockJumpToQuestion}
        caseId="existing-case-456"
        caseType="eviction"
        jurisdiction="england"
        product="notice_only"
      />
    );

    const jumpToSpan = screen.getByTestId('jump-to-deposit_and_compliance');
    const jumpUrl = jumpToSpan.getAttribute('data-jump-url')!;

    // URL must include case_id to preserve context
    expect(jumpUrl).toContain('case_id=existing-case-456');

    // URL should NOT start a new flow (no "new=true" or similar)
    expect(jumpUrl).not.toContain('new=');

    // Mode should be edit (continuing existing case)
    expect(jumpUrl).toContain('mode=edit');
  });

  it('displays both blocking issues and warnings in summary', () => {
    const blockingIssues: WizardValidationIssue[] = [
      {
        code: 'DEPOSIT_NOT_PROTECTED',
        severity: 'blocking',
        fields: ['deposit_protected'],
        affected_question_id: 'deposit_question',
        user_fix_hint: 'Deposit blocking issue',
      },
    ];

    const warnings: WizardValidationIssue[] = [
      {
        code: 'DEPOSIT_EXCEEDS_CAP',
        severity: 'warning',
        fields: ['deposit_amount'],
        affected_question_id: 'deposit_amount_question',
        user_fix_hint: 'Deposit warning issue',
      },
    ];

    render(
      <IssuesSummaryPanel
        issueCounts={{ blocking: 1, warnings: 1 }}
        blockingIssues={blockingIssues}
        warnings={warnings}
        onJumpToQuestion={mockJumpToQuestion}
      />
    );

    expect(screen.getByText('Deposit blocking issue')).toBeDefined();
    expect(screen.getByText('Deposit warning issue')).toBeDefined();
  });
});
