/**
 * NextBestActionCard Component Tests
 *
 * Tests that the Ask Heaven CTA card:
 * - Renders correct CTAs for eviction/arrears/tenancy topics
 * - Respects jurisdiction constraints (NI restrictions)
 * - Shows wizard CTAs when suggestedNextStep is 'wizard'
 * - Shows checklist CTAs for compliance topics
 * - Uses jurisdiction-appropriate copy
 *
 * @module tests/components/NextBestActionCard.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextBestActionCard } from '@/components/ask-heaven/NextBestActionCard';
import type { Topic } from '@/lib/ask-heaven/topic-detection';

// =============================================================================
// Test Helpers
// =============================================================================

const mockAttribution = {
  src: 'ask_heaven',
  utm_source: 'test',
  utm_medium: 'test',
  utm_campaign: 'test',
};

const mockOnCtaClick = vi.fn();
const mockOnRequestEmailCapture = vi.fn();

const defaultProps = {
  topic: 'eviction' as Topic,
  jurisdiction: 'england' as const,
  attribution: mockAttribution,
  onCtaClick: mockOnCtaClick,
  onRequestEmailCapture: mockOnRequestEmailCapture,
};

// =============================================================================
// Eviction Topic Tests
// =============================================================================

describe('NextBestActionCard - Eviction Topic', () => {
  it('renders eviction CTA for England', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="eviction"
        jurisdiction="england"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText('Next best step')).toBeInTheDocument();
    expect(screen.getByText('Serve an Eviction Notice')).toBeInTheDocument();
    expect(screen.getByText(/Create a compliant Section 21 or Section 8 notice/i)).toBeInTheDocument();
  });

  it('renders Section 173 CTA for Wales', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="eviction"
        jurisdiction="wales"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText('Serve a Section 173 Notice')).toBeInTheDocument();
    expect(screen.getByText(/renting homes act/i)).toBeInTheDocument();
  });

  it('renders Notice to Leave CTA for Scotland', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="eviction"
        jurisdiction="scotland"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText('Serve a Notice to Leave')).toBeInTheDocument();
    expect(screen.getByText(/prt tenancies/i)).toBeInTheDocument();
  });

  it('shows Northern Ireland info notice instead of CTA', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="eviction"
        jurisdiction="northern-ireland"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText('Northern Ireland Notice')).toBeInTheDocument();
    expect(screen.getByText(/not currently available/i)).toBeInTheDocument();
    expect(screen.queryByText(/start.*wizard/i)).not.toBeInTheDocument();
  });

  it('shows secondary validators for England eviction', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="eviction"
        jurisdiction="england"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText(/section 21 checker/i)).toBeInTheDocument();
    expect(screen.getByText(/section 8 checker/i)).toBeInTheDocument();
  });
});

// =============================================================================
// Arrears Topic Tests
// =============================================================================

describe('NextBestActionCard - Arrears Topic', () => {
  it('renders money claim CTA for England', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="arrears"
        jurisdiction="england"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText('Next best step')).toBeInTheDocument();
    expect(screen.getByText('Money Claim Pack')).toBeInTheDocument();
  });

  it('renders Notice to Leave for Scotland arrears (money claim not available)', () => {
    // Money claim is England-only as of January 2026
    // Scotland arrears should recommend Notice to Leave instead
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="arrears"
        jurisdiction="scotland"
        suggestedNextStep="wizard"
      />
    );

    // Should show Notice to Leave, not money claim
    expect(screen.getByText('Notice to Leave')).toBeInTheDocument();
    expect(screen.getByText(/rent arrears under PRT/i)).toBeInTheDocument();
  });

  it('shows Northern Ireland info notice for arrears', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="arrears"
        jurisdiction="northern-ireland"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText('Northern Ireland Notice')).toBeInTheDocument();
    expect(screen.getByText(/not currently available/i)).toBeInTheDocument();
  });

  it('shows related tools for arrears in England', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="arrears"
        jurisdiction="england"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText(/arrears calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/free demand letter/i)).toBeInTheDocument();
  });
});

// =============================================================================
// Tenancy Topic Tests
// =============================================================================

describe('NextBestActionCard - Tenancy Topic', () => {
  it('renders AST CTA for England', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="tenancy"
        jurisdiction="england"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText('Next best step')).toBeInTheDocument();
    expect(screen.getByText('Create a Tenancy Agreement')).toBeInTheDocument();
    expect(screen.getByText(/Assured Shorthold Tenancy/i)).toBeInTheDocument();
  });

  it('renders Occupation Contract CTA for Wales', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="tenancy"
        jurisdiction="wales"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText('Create an Occupation Contract')).toBeInTheDocument();
    expect(screen.getByText(/renting homes act/i)).toBeInTheDocument();
  });

  it('renders PRT CTA for Scotland', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="tenancy"
        jurisdiction="scotland"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText('Create a PRT Agreement')).toBeInTheDocument();
    expect(screen.getByText(/Private Residential Tenancy/i)).toBeInTheDocument();
  });

  it('renders Tenancy Agreement CTA for Northern Ireland', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="tenancy"
        jurisdiction="northern-ireland"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText('Create a Tenancy Agreement')).toBeInTheDocument();
    expect(screen.queryByText('Northern Ireland Notice')).not.toBeInTheDocument();
  });
});

// =============================================================================
// Compliance Topic Tests
// =============================================================================

describe('NextBestActionCard - Compliance Topics', () => {
  it('renders deposit checklist CTA', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="deposit"
        jurisdiction="england"
        suggestedNextStep="checklist"
        questionCount={1}
      />
    );

    expect(screen.getByText('Deposit Protection Checklist')).toBeInTheDocument();
    expect(screen.getByText(/Get a free checklist/i)).toBeInTheDocument();
  });

  it('renders EPC checklist CTA', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="epc"
        jurisdiction="england"
        suggestedNextStep="checklist"
        questionCount={1}
      />
    );

    expect(screen.getByText('EPC Compliance Checklist')).toBeInTheDocument();
  });

  it('renders gas safety checklist CTA', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="gas_safety"
        jurisdiction="england"
        suggestedNextStep="checklist"
        questionCount={1}
      />
    );

    expect(screen.getByText('Gas Safety Checklist')).toBeInTheDocument();
  });

  it('renders EICR checklist CTA', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="eicr"
        jurisdiction="england"
        suggestedNextStep="checklist"
        questionCount={1}
      />
    );

    expect(screen.getByText('EICR Checklist')).toBeInTheDocument();
  });

  it('renders smoke alarm checklist CTA', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="smoke_alarm"
        jurisdiction="england"
        suggestedNextStep="checklist"
        questionCount={1}
      />
    );

    expect(screen.getByText('Smoke & CO Alarm Checklist')).toBeInTheDocument();
  });

  it('renders right to rent checklist CTA', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="right_to_rent"
        jurisdiction="england"
        suggestedNextStep="checklist"
        questionCount={1}
      />
    );

    expect(screen.getByText('Right to Rent Checklist')).toBeInTheDocument();
  });

  it('shows guide link for compliance topics', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="deposit"
        jurisdiction="england"
        suggestedNextStep="checklist"
        questionCount={1}
      />
    );

    expect(screen.getByText('Read full guide')).toBeInTheDocument();
  });
});

// =============================================================================
// CTA Click Tracking Tests
// =============================================================================

describe('NextBestActionCard - Click Tracking', () => {
  it('calls onCtaClick when wizard button clicked', async () => {
    const user = userEvent.setup();

    render(
      <NextBestActionCard
        {...defaultProps}
        topic="eviction"
        jurisdiction="england"
        suggestedNextStep="wizard"
      />
    );

    const wizardButton = screen.getByRole('link', { name: /start.*wizard/i });
    await user.click(wizardButton);

    expect(mockOnCtaClick).toHaveBeenCalled();
    expect(mockOnCtaClick).toHaveBeenCalledWith(
      'next_best_action',
      expect.stringContaining('/wizard'),
      expect.any(String)
    );
  });

  it('calls onRequestEmailCapture for checklist when question count >= 1', async () => {
    const user = userEvent.setup();

    render(
      <NextBestActionCard
        {...defaultProps}
        topic="deposit"
        jurisdiction="england"
        suggestedNextStep="checklist"
        questionCount={2}
      />
    );

    const checklistButton = screen.getByRole('button', { name: /get free checklist/i });
    await user.click(checklistButton);

    expect(mockOnRequestEmailCapture).toHaveBeenCalledWith('compliance_checklist');
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('NextBestActionCard - Edge Cases', () => {
  it('returns null when topic is null', () => {
    const { container } = render(
      <NextBestActionCard
        {...defaultProps}
        topic={null as any}
        jurisdiction="england"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null for general topic', () => {
    const { container } = render(
      <NextBestActionCard
        {...defaultProps}
        topic={'general' as any}
        jurisdiction="england"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows "ask a question" prompt when question count is 0 for checklist', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="deposit"
        jurisdiction="england"
        suggestedNextStep="checklist"
        questionCount={0}
      />
    );

    expect(screen.getByText(/ask a question to unlock/i)).toBeInTheDocument();
  });
});

// =============================================================================
// Jurisdiction Safety Tests
// =============================================================================

describe('NextBestActionCard - Jurisdiction Safety', () => {
  it('never shows eviction wizard CTA for Northern Ireland', () => {
    const { container } = render(
      <NextBestActionCard
        {...defaultProps}
        topic="eviction"
        jurisdiction="northern-ireland"
        suggestedNextStep="wizard"
      />
    );

    // Should show info notice, not wizard CTA
    expect(screen.queryByRole('link', { name: /start.*wizard/i })).not.toBeInTheDocument();
    expect(screen.getByText('Northern Ireland Notice')).toBeInTheDocument();
  });

  it('never shows money claim wizard CTA for Northern Ireland', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="arrears"
        jurisdiction="northern-ireland"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.queryByRole('link', { name: /start.*wizard/i })).not.toBeInTheDocument();
    expect(screen.getByText('Northern Ireland Notice')).toBeInTheDocument();
  });

  it('shows tenancy agreement wizard CTA for Northern Ireland', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="tenancy"
        jurisdiction="northern-ireland"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByRole('link', { name: /start.*wizard/i })).toBeInTheDocument();
    expect(screen.queryByText('Northern Ireland Notice')).not.toBeInTheDocument();
  });

  it('offers tenancy agreement as alternative in NI notice', () => {
    render(
      <NextBestActionCard
        {...defaultProps}
        topic="eviction"
        jurisdiction="northern-ireland"
        suggestedNextStep="wizard"
      />
    );

    expect(screen.getByText(/tenancy agreement instead/i)).toBeInTheDocument();
  });
});
