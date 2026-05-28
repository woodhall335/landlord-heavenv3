/** @vitest-environment jsdom */

import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AnimatedReviewShell,
  getWizardReviewPhaseIndex,
  getWizardReviewProgress,
  WIZARD_REVIEW_ANIMATION_DURATION_MS,
} from '../AnimatedReviewShell';

const defaultProps = {
  title: 'Notice review',
  subtitle: 'Checking the landlord answers before preparing the notice pack.',
  routeLabel: 'England notice route',
  scoreLabel: 'Notice readiness',
  scoreValue: '82/100',
  scoreTone: 'strong',
  phases: [
    { label: 'Opening review', shortLabel: 'Route', detail: 'Checking the route.' },
    { label: 'Checking facts', shortLabel: 'Facts', detail: 'Checking the answers.' },
    { label: 'Preparing results', shortLabel: 'Results', detail: 'Preparing the review.' },
  ],
  stats: [
    { label: 'Jurisdiction', value: 'England' },
    { label: 'Output', value: 'Notice pack' },
  ],
  checks: ['Route checked', 'Facts reviewed', 'Final review ready'],
  positives: ['The route can be reviewed from the answers provided.'],
  warnings: ['Check the records before serving.'],
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

describe('AnimatedReviewShell helpers', () => {
  it('clamps progress and phase index', () => {
    expect(getWizardReviewProgress(-1)).toBe(0);
    expect(getWizardReviewProgress(10000)).toBe(50);
    expect(getWizardReviewProgress(30000)).toBe(100);
    expect(getWizardReviewPhaseIndex(0, 3)).toBe(0);
    expect(getWizardReviewPhaseIndex(WIZARD_REVIEW_ANIMATION_DURATION_MS, 3)).toBe(2);
  });
});

describe('AnimatedReviewShell', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-28T10:00:00Z'));
    mockMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('locks detailed review content until the 20 second review completes', () => {
    render(
      <AnimatedReviewShell {...defaultProps}>
        <button>Continue to document preview</button>
      </AnimatedReviewShell>
    );

    expect(screen.getByText('Detailed review locked')).toBeInTheDocument();
    expect(screen.queryByText('Continue to document preview')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(WIZARD_REVIEW_ANIMATION_DURATION_MS);
    });

    expect(screen.getByText('Continue to document preview')).toBeInTheDocument();
  });

  it('renders completed state immediately for reduced motion users', async () => {
    mockMatchMedia(true);

    render(
      <AnimatedReviewShell {...defaultProps}>
        <button>Continue to document preview</button>
      </AnimatedReviewShell>
    );

    await act(async () => {});

    expect(screen.getByText('Continue to document preview')).toBeInTheDocument();
    expect(screen.queryByText('Detailed review locked')).not.toBeInTheDocument();
  });
});
