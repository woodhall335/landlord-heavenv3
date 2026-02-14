/**
 * Regression tests for ValidationErrors component routing
 *
 * Tests that "Go to question" preserves case context (type, jurisdiction, mode, product)
 * instead of dropping the case and starting a new flow.
 *
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationErrors } from '@/components/ui/ValidationErrors';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ValidationErrors component - Go to question routing', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('includes case_id in the Go to question URL', () => {
    render(
      <ValidationErrors
        blocking_issues={[
          {
            code: 'DEPOSIT_NOT_PROTECTED',
            fields: ['deposit_protected'],
            affected_question_id: 'deposit_and_compliance',
            user_fix_hint: 'Deposit must be protected',
          },
        ]}
        warnings={[]}
        caseId="test-case-123"
      />
    );

    // Component renders "Go to: Deposit And Compliance →" (question_id converted to Title Case)
    const goToQuestionButton = screen.getByText(/Go to: .+ →/);
    fireEvent.click(goToQuestionButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
    const url = mockPush.mock.calls[0][0];
    expect(url).toContain('case_id=test-case-123');
  });

  it('includes type, jurisdiction, and product when provided', () => {
    render(
      <ValidationErrors
        blocking_issues={[
          {
            code: 'DEPOSIT_NOT_PROTECTED',
            fields: ['deposit_protected'],
            affected_question_id: 'deposit_and_compliance',
            user_fix_hint: 'Deposit must be protected',
          },
        ]}
        warnings={[]}
        caseId="test-case-456"
        caseType="eviction"
        jurisdiction="england"
        product="notice_only"
      />
    );

    // Component renders "Go to: Deposit And Compliance →" (question_id converted to Title Case)
    const goToQuestionButton = screen.getByText(/Go to: .+ →/);
    fireEvent.click(goToQuestionButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
    const url = mockPush.mock.calls[0][0];

    // Should include all routing params to preserve context
    expect(url).toContain('case_id=test-case-456');
    expect(url).toContain('type=eviction');
    expect(url).toContain('jurisdiction=england');
    expect(url).toContain('product=notice_only');
    expect(url).toContain('mode=edit');
    expect(url).toContain('jump_to=deposit_and_compliance');
  });

  it('includes mode=edit in the URL', () => {
    render(
      <ValidationErrors
        blocking_issues={[
          {
            code: 'MISSING_FIELD',
            fields: ['tenant_name'],
            affected_question_id: 'tenant_details',
            user_fix_hint: 'Please provide tenant name',
          },
        ]}
        warnings={[]}
        caseId="test-case-789"
      />
    );

    // Component renders "Go to: Tenant Details →" (question_id converted to Title Case)
    const goToQuestionButton = screen.getByText(/Go to: .+ →/);
    fireEvent.click(goToQuestionButton);

    const url = mockPush.mock.calls[0][0];
    expect(url).toContain('mode=edit');
  });

  it('displays correct issue count for multiple blocking issues', () => {
    render(
      <ValidationErrors
        blocking_issues={[
          {
            code: 'DEPOSIT_NOT_PROTECTED',
            fields: ['deposit_protected'],
            affected_question_id: 'deposit_and_compliance',
            user_fix_hint: 'Deposit must be protected',
          },
          {
            code: 'PRESCRIBED_INFO_NOT_GIVEN',
            fields: ['prescribed_info_given'],
            affected_question_id: 'deposit_and_compliance',
            user_fix_hint: 'Prescribed information must be provided',
          },
        ]}
        warnings={[]}
        caseId="test-case-multi"
      />
    );

    // Should have two "Go to question" buttons (one for each issue)
    // Component renders "Go to: Deposit And Compliance →" format
    const buttons = screen.getAllByText(/Go to: .+ →/);
    expect(buttons).toHaveLength(2);

    // Both issues should be displayed
    expect(screen.getByText('Deposit must be protected')).toBeDefined();
    expect(screen.getByText('Prescribed information must be provided')).toBeDefined();
  });

  it('handles Complete Wizard button correctly', () => {
    render(
      <ValidationErrors
        blocking_issues={[
          {
            code: 'MISSING_FIELD',
            fields: ['landlord_name'],
            user_fix_hint: 'Please provide landlord name',
            // No affected_question_id - should still work with Complete Wizard
          },
        ]}
        warnings={[]}
        caseId="test-case-complete"
        caseType="eviction"
        jurisdiction="wales"
        product="complete_pack"
      />
    );

    // Component shows "Fix all issues" button (not "Complete Wizard")
    const fixAllIssuesButton = screen.getByText('Fix all issues');
    fireEvent.click(fixAllIssuesButton);

    const url = mockPush.mock.calls[0][0];
    expect(url).toContain('case_id=test-case-complete');
    expect(url).toContain('type=eviction');
    expect(url).toContain('jurisdiction=wales');
    expect(url).toContain('product=complete_pack');
    expect(url).toContain('mode=edit');
    // Should NOT have jump_to when using Complete Wizard (goes to start of flow)
    expect(url).not.toContain('jump_to');
  });
});

describe('ValidationErrors component - Phase 13 enhanced fields', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders Phase 13 title, howToFix, legalRef, and helpUrl when provided', () => {
    render(
      <ValidationErrors
        blocking_issues={[
          {
            code: 's21_deposit_cap_exceeded',
            fields: ['deposit_amount'],
            affected_question_id: 'deposit_details',
            user_fix_hint: 'Reduce deposit amount',
            title: 'Deposit Exceeds Legal Cap',
            howToFix: [
              'Check the deposit amount entered',
              'Ensure it does not exceed 5 weeks rent',
              'Update the deposit field if incorrect',
            ],
            legalRef: 'Tenant Fees Act 2019, s.3',
            helpUrl: 'https://example.com/help/deposit-cap',
          },
        ]}
        warnings={[]}
        caseId="test-case-phase13"
      />
    );

    // Title should be rendered as main heading
    expect(screen.getByText('Deposit Exceeds Legal Cap')).toBeDefined();

    // How to fix steps should be rendered as list items
    expect(screen.getByText('Check the deposit amount entered')).toBeDefined();
    expect(screen.getByText('Ensure it does not exceed 5 weeks rent')).toBeDefined();
    expect(screen.getByText('Update the deposit field if incorrect')).toBeDefined();

    // Legal reference should be rendered
    expect(screen.getByText(/Tenant Fees Act 2019, s.3/)).toBeDefined();

    // Help URL should be rendered as a link
    const learnMoreLink = screen.getByText('Learn more →');
    expect(learnMoreLink).toBeDefined();
    expect(learnMoreLink.getAttribute('href')).toBe('https://example.com/help/deposit-cap');
    expect(learnMoreLink.getAttribute('target')).toBe('_blank');
    expect(learnMoreLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders old layout when Phase 13 fields are not provided', () => {
    render(
      <ValidationErrors
        blocking_issues={[
          {
            code: 'DEPOSIT_NOT_PROTECTED',
            fields: ['deposit_protected'],
            affected_question_id: 'deposit_and_compliance',
            user_fix_hint: 'Deposit must be protected in a government scheme',
          },
        ]}
        warnings={[]}
        caseId="test-case-legacy"
      />
    );

    // User fix hint should be displayed as the main message
    expect(screen.getByText('Deposit must be protected in a government scheme')).toBeDefined();

    // No Phase 13 elements should be rendered
    expect(screen.queryByText('Legal reference:')).toBeNull();
    expect(screen.queryByText('Learn more →')).toBeNull();
  });

  it('renders Phase 13 fields in warnings section', () => {
    render(
      <ValidationErrors
        blocking_issues={[]}
        warnings={[
          {
            code: 's21_notice_period_short',
            fields: ['notice_period'],
            affected_question_id: 'notice_details',
            user_fix_hint: 'Consider extending notice period',
            title: 'Notice Period May Be Short',
            howToFix: ['Review the minimum notice period requirements'],
            legalRef: 'Housing Act 1988, s.21',
            helpUrl: 'https://example.com/help/notice-period',
          },
        ]}
        caseId="test-case-warning-phase13"
        product="complete_pack"
      />
    );

    // Title should be rendered
    expect(screen.getByText('Notice Period May Be Short')).toBeDefined();

    // How to fix should be rendered
    expect(screen.getByText('Review the minimum notice period requirements')).toBeDefined();

    // Legal reference should be rendered
    expect(screen.getByText(/Housing Act 1988, s.21/)).toBeDefined();

    // Help URL should be rendered
    expect(screen.getByText('Learn more →')).toBeDefined();
  });
});
