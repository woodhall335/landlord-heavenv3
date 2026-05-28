/** @vitest-environment jsdom */

import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  getMoneyClaimReviewPhaseIndex,
  getMoneyClaimReviewProgress,
  getMoneyClaimReviewSessionKey,
  getMoneyClaimVisibleSections,
  MONEY_CLAIM_REVIEW_DURATION_MS,
  MoneyClaimAnimatedReview,
} from '../MoneyClaimAnimatedReview';

const analysis = {
  case_strength_score: 80,
  case_strength_band: 'strong',
  case_summary: {
    total_arrears: 1775,
    damages: 0,
    other_charges: 0,
    charge_interest: true,
    interest_rate: 8,
    pre_action_status: 'partial',
  },
  case_health: {
    positives: [
      'Arrears recorded at around £1775.',
      'PAP Debt paperwork is recorded or will be generated; wait the response period before issuing.',
    ],
    warnings: [
      {
        message: 'Have the tenancy agreement ready to attach or exhibit if the tenant disputes the rent terms.',
      },
    ],
    risks: [],
    blockers: [],
  },
};

const defaultProps = {
  caseId: 'case-123',
  analysis,
  jurisdiction: 'england',
  caseStrengthBand: 'strong',
  readinessSummary:
    'Your money claim looks ready to prepare from the answers provided.',
  redFlags: [],
  complianceIssues: [
    'Have the tenancy agreement ready to attach or exhibit if the tenant disputes the rent terms.',
    'Check the rent schedule generated from your answers and keep any rent account or payment record that supports it.',
  ],
  evidence: {
    tenancy_agreement_uploaded: false,
    rent_schedule_uploaded: false,
    bank_statements_uploaded: false,
    correspondence_uploaded: false,
  },
  hasBlockingIssues: false,
  onFixIssues: vi.fn(),
  onEdit: vi.fn(),
  onProceed: vi.fn(),
  isPaid: false,
  isRegenerating: false,
  isLoadingPaymentStatus: false,
};

function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('MoneyClaimAnimatedReview helpers', () => {
  it('clamps progress between 0 and 100', () => {
    expect(getMoneyClaimReviewProgress(-100)).toBe(0);
    expect(getMoneyClaimReviewProgress(10000)).toBe(50);
    expect(getMoneyClaimReviewProgress(30000)).toBe(100);
  });

  it('moves through all phases during the 20 second review', () => {
    expect(getMoneyClaimReviewPhaseIndex(0)).toBe(0);
    expect(getMoneyClaimReviewPhaseIndex(7000)).toBeGreaterThan(0);
    expect(getMoneyClaimReviewPhaseIndex(MONEY_CLAIM_REVIEW_DURATION_MS)).toBe(5);
  });

  it('unlocks visible result sections in order', () => {
    expect(getMoneyClaimVisibleSections(19).figures).toBe(false);
    expect(getMoneyClaimVisibleSections(20).figures).toBe(true);
    expect(getMoneyClaimVisibleSections(40).protocol).toBe(true);
    expect(getMoneyClaimVisibleSections(60).evidence).toBe(true);
    expect(getMoneyClaimVisibleSections(80).final).toBe(true);
    expect(getMoneyClaimVisibleSections(100).actions).toBe(true);
  });
});

describe('MoneyClaimAnimatedReview component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-28T10:00:00Z'));
    sessionStorage.clear();
    mockMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('runs first visit as an animated review and unlocks actions at completion', async () => {
    render(<MoneyClaimAnimatedReview {...defaultProps} />);

    expect(screen.getByText('Review running...')).toBeDisabled();
    expect(screen.getAllByText('Reviewing').length).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(MONEY_CLAIM_REVIEW_DURATION_MS);
    });

    expect(screen.getByText('Continue to document preview')).toBeEnabled();
    expect(screen.getByText('£1,775.00')).toBeInTheDocument();
    expect(screen.getByText('£1,810.50')).toBeInTheDocument();
    expect(sessionStorage.getItem(getMoneyClaimReviewSessionKey('case-123'))).toBe('complete');
  });

  it('skips the animation for the same case once the session has seen it', async () => {
    sessionStorage.setItem(getMoneyClaimReviewSessionKey('case-123'), 'complete');

    render(<MoneyClaimAnimatedReview {...defaultProps} />);

    await act(async () => {});

    expect(screen.getByText('Continue to document preview')).toBeEnabled();
    expect(screen.queryByText('Review running...')).not.toBeInTheDocument();
  });

  it('runs again for a different case id', () => {
    sessionStorage.setItem(getMoneyClaimReviewSessionKey('case-123'), 'complete');

    render(<MoneyClaimAnimatedReview {...defaultProps} caseId="case-456" />);

    expect(screen.getByText('Review running...')).toBeDisabled();
  });

  it('uses answer-based language rather than fake uploaded-file wording', () => {
    render(<MoneyClaimAnimatedReview {...defaultProps} />);

    expect(screen.queryByText(/ingesting/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/uploaded file|document ingestion/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Claim answers loaded/i)).toBeInTheDocument();
  });

  it('respects reduced motion by rendering the completed state immediately', async () => {
    mockMatchMedia(true);

    render(<MoneyClaimAnimatedReview {...defaultProps} caseId="case-reduced-motion" />);

    await act(async () => {});

    expect(screen.getByText('Continue to document preview')).toBeEnabled();
    expect(screen.getByText('£1,810.50')).toBeInTheDocument();
  });
});
