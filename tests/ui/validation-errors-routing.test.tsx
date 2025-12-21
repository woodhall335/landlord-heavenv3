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

    const goToQuestionButton = screen.getByText('Go to question →');
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

    const goToQuestionButton = screen.getByText('Go to question →');
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

    const goToQuestionButton = screen.getByText('Go to question →');
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
    const buttons = screen.getAllByText('Go to question →');
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

    const completeWizardButton = screen.getByText('✏️ Complete Wizard');
    fireEvent.click(completeWizardButton);

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
